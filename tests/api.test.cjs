const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}, globals = {}) {
  const cache = {};
  const load = (name, parent = path.join(root, 'index.ts')) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('.') && !path.isAbsolute(name)) return require(name);
    let file = path.resolve(path.dirname(parent), name);
    if (!path.extname(file)) file += '.ts';
    if (cache[file]) return cache[file].exports;
    const module = { exports: {} }; cache[file] = module;
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(source, { module, exports: module.exports, require: dependency => load(dependency, file), process: { env: { EXPO_PUBLIC_API_URL: 'https://example.test/api/' } }, Headers, Response, FormData, URL, Uint8Array, btoa, atob, ...globals }, { filename: file });
    return module.exports;
  };
  return name => load(path.join(root, name));
}
function apiHarness(responses) {
  const calls = [];
  let token = 'saved-token';
  const load = loader({ './session': { session: { getAccessToken: async () => token, setAccessToken: async value => { token = value; } } } }, { fetch: async (url, init) => { calls.push({ url, init }); const response = responses.shift(); if (response instanceof Error) throw response; return response; } });
  return { load, calls, token: () => token };
}
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });

test('EPI search keeps nr_registro_ca and leading zeros across pagination', async () => {
  const h = apiHarness([json({ data: [] }), json({ data: [] })]);
  const { endpoints } = h.load('src/api/endpoints.ts');
  const { listPage } = h.load('src/api/resources.ts');
  await listPage(endpoints.searchEpis(' 00123 '));
  await listPage(endpoints.searchEpis(' 00123 '), 2);
  assert.equal(h.calls[0].url, 'https://example.test/api/epis?nr_registro_ca=00123&page=1');
  assert.equal(h.calls[1].url, 'https://example.test/api/epis?nr_registro_ca=00123&page=2');
  assert.equal(endpoints.searchEpis('12&3'), '/epis?nr_registro_ca=12%263');
});

test('base /api is used exactly once and Bearer is preserved', async () => {
  const h = apiHarness([json({ data: [] })]);
  await h.load('src/api/client.ts').apiFetch('/documentos');
  assert.equal(h.calls[0].url, 'https://example.test/api/documentos');
  assert.equal(h.calls[0].init.headers.get('Authorization'), 'Bearer saved-token');
});
test('validation errors and HTTP failures are never treated as success', async () => {
  const h = apiHarness([json({ errors: { chave: ['Chave inválida.'] } }, 422)]);
  await assert.rejects(h.load('src/api/client.ts').apiFetch('/notas-fiscais/importar'), error => error.status === 422 && error.message === 'Chave inválida.');
});
test('multipart retains automatic boundary and DELETE accepts 204', async () => {
  const h = apiHarness([json({ data: { id: 1 } }), new Response(null, { status: 204 })]);
  const client = h.load('src/api/client.ts');
  const form = new FormData(); form.append('title', 'PDF');
  await client.apiFetch('/documentos', { method: 'POST', body: form });
  assert.equal(h.calls[0].init.headers.has('Content-Type'), false);
  assert.equal(await client.apiFetch('/dispositivos/id', { method: 'DELETE' }), undefined);
});
test('Laravel resource, paginator and nested device pages are recognized', async () => {
  const h = apiHarness([json({ data: [{ id: 1 }], meta: { current_page: 1, last_page: 2 } }), json({ data: { data: [{ id: 2 }], current_page: 2, last_page: 2 } })]);
  const { listPage } = h.load('src/api/resources.ts');
  const first = await listPage('/documentos'); const second = await listPage('/dispositivos', 2);
  assert.equal(first.items[0].id, 1); assert.equal(first.hasMore, true);
  assert.equal(second.items[0].id, 2); assert.equal(second.hasMore, false);
  assert.equal(h.calls[1].url, 'https://example.test/api/dispositivos?page=2');
});
test('registration and reset use actual Laravel field names', async () => {
  const h = apiHarness([json({ token: 'new-token' }), json({ message: 'ok' })]);
  const auth = h.load('src/api/auth.ts');
  await auth.registerCompany({ companyName: 'Empresa', responsibleName: 'Pessoa', cnpj: '123', email: 'a@b.com', password: '12345678' });
  assert.deepEqual(JSON.parse(h.calls[0].init.body), { nome_empresa: 'Empresa', nome_responsavel: 'Pessoa', cnpj: '123', email: 'a@b.com', password: '12345678' });
  assert.equal(h.token(), 'new-token');
  await auth.resetPassword('a@b.com', 'reset-token', '12345678', '12345678');
  assert.equal(JSON.parse(h.calls[1].init.body).password_confirmation, '12345678');
});
test('login refuses a missing access token', async () => {
  const h = apiHarness([json({ message: 'ok' })]);
  await assert.rejects(h.load('src/api/auth.ts').login('a@b.com', 'bad'), /token/);
  assert.equal(h.token(), 'saved-token');
});
test('download authorization never leaks token to another origin', async () => {
  const h = apiHarness([]);
  const { downloadAuthorization } = h.load('src/api/downloadAuth.ts');
  assert.equal((await downloadAuthorization('https://example.test/api/documentos/id/baixar?signature=abc')).Authorization, 'Bearer saved-token');
  await assert.rejects(downloadAuthorization('https://elsewhere.test/file'), /origem/);
});
test('P-256 PEM and DER signature interoperate with OpenSSL and reject altered payload', () => {
  const signing = loader()('src/security/signatureCrypto.ts');
  const secret = new Uint8Array(crypto.randomBytes(32));
  const pem = signing.publicKeyPem(secret);
  const payload = Buffer.from('document-hash|session|nonce|expiry');
  const signature = Buffer.from(signing.signPayload(secret, payload.toString('base64')), 'base64');
  assert.equal(crypto.createPublicKey(pem).asymmetricKeyDetails.namedCurve, 'prime256v1');
  assert.equal(crypto.verify('sha256', payload, pem, signature), true);
  assert.equal(crypto.verify('sha256', Buffer.from('tampered'), pem, signature), false);
});
