const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/validation/cpf.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { isValidCpf } = context.exports;

test('accepts valid CPFs with or without formatting and preserves leading zeros', () => {
  for (const cpf of ['52998224725', '529.982.247-25', '11144477735', '01234567890', ' 012.345.678-90 ']) {
    assert.equal(isValidCpf(cpf), true, cpf);
  }
});

test('rejects either incorrect check digit', () => {
  for (const cpf of ['52998224715', '52998224724']) {
    assert.equal(isValidCpf(cpf), false, cpf);
  }
});

test('rejects all repeated-digit sequences', () => {
  for (let digit = 0; digit <= 9; digit++) {
    assert.equal(isValidCpf(String(digit).repeat(11)), false);
  }
});

test('rejects missing digits, extra digits, letters and malformed formatting', () => {
  for (const cpf of ['', '   ', '5299822472', '529982247255', 'abc52998224725', '529.982247-25', '52998224725!']) {
    assert.equal(isValidCpf(cpf), false, cpf);
  }
});
