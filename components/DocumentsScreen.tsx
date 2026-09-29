import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, FormField, PageCard } from './ui';
import { SignaturePad, type Point } from './SignaturePad';
import { endpoints } from '../src/api/endpoints';
import { apiFetch } from '../src/api/client';
import { jsonRequest } from '../src/api/resources';
import { downloadDocument, getDocument, uploadPdf, type SignatureDocument, type DocumentVersion, type Signer, type SignatureSession } from '../src/api/documents';
import { useRemoteList } from '../src/hooks/useRemoteList';
import { deviceSigning } from '../src/security/deviceSigning';

export function DocumentsScreen() {
  const remote = useRemoteList<SignatureDocument>(endpoints.documents);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<SignatureDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState<{ valid: boolean; signatures: number; signed_at: string; document_hash: string } | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha na operação.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
    <PageCard><Text style={{ fontSize: 24, fontWeight: '700', color: '#12355B' }}>Documentos e assinaturas</Text>
      <View style={{ gap: 12, marginVertical: 16 }}><FormField label="Título do documento" value={title} onChangeText={setTitle} /><FormField label="Descrição" value={description} onChangeText={setDescription} /></View>
      <AppButton title="Selecionar e enviar PDF" disabled={busy} onPress={() => void run(async () => { if (!title.trim()) throw new Error('Informe o título.'); if (await uploadPdf(undefined, title.trim(), description.trim())) { setTitle(''); setDescription(''); await remote.refresh(); setMessage('Documento enviado.'); } })} />
      {!!message && <Text accessibilityRole="alert">{message}</Text>}
    </PageCard>
    <PageCard><AppButton title="Atualizar documentos" disabled={busy || remote.loading} onPress={remote.refresh} />
      {!!remote.error && <Text accessibilityRole="alert">{remote.error}</Text>}
      {remote.loading && <Text>Carregando documentos...</Text>}
      {!remote.loading && !remote.items.length && <Text>Nenhum documento encontrado.</Text>}
      {remote.items.map(doc => <View key={doc.id} style={{ paddingVertical: 12, gap: 8 }}><Text>{doc.title} · {doc.status}</Text><AppButton title="Abrir documento" disabled={busy} onPress={() => void run(async () => setSelected(await getDocument(doc.id)))} /></View>)}
    </PageCard>
    {selected && <DocumentDetails key={selected.id} document={selected} onClose={() => setSelected(null)} onChanged={remote.refresh} />}
    <PageCard><FormField label="Código de verificação da assinatura" value={code} onChangeText={value => { setCode(value); setVerification(null); }} autoCapitalize="none" />
      <AppButton title="Verificar autenticidade" disabled={busy} onPress={() => void run(async () => { setVerification(null); if (!/^[a-f0-9]{64}$/.test(code.trim())) throw new Error('Informe o código de 64 caracteres do documento assinado.'); setVerification(await apiFetch(endpoints.verify(code.trim()))); })} />
      {verification && <View><Text>{verification.valid ? 'Assinatura válida' : 'Verificação inválida'}</Text><Text>Assinaturas: {verification.signatures} · {verification.signed_at}</Text><Text selectable>Hash: {verification.document_hash}</Text></View>}
    </PageCard>
  </ScrollView>;
}

function DocumentDetails({ document, onClose, onChanged }: { document: SignatureDocument; onClose: () => void; onChanged: () => Promise<void> }) {
  const [doc, setDoc] = useState(document);
  const versions = useRemoteList<DocumentVersion>(endpoints.versions(doc.id));
  const signers = useRemoteList<Signer>(endpoints.signers(doc.id));
  const [userId, setUserId] = useState('');
  const [order, setOrder] = useState('');
  const [session, setSession] = useState<SignatureSession | null>(null);
  const [consented, setConsented] = useState(false);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha na operação.'); }
    finally { setBusy(false); }
  };
  const refresh = async () => { setDoc(await getDocument(doc.id)); await Promise.all([versions.refresh(), signers.refresh(), onChanged()]); };
  const activeSession = () => {
    if (!session || Date.parse(session.expires_at) <= Date.now()) throw new Error('Sessão expirada. Inicie outra sessão de assinatura.');
    return session;
  };
  const complete = async (method: 'handwritten' | 'biometric') => {
    const current = activeSession();
    if (!consented) throw new Error('Leia e aceite o consentimento antes de assinar.');
    if (method === 'handwritten') {
      if (!strokes.length) throw new Error('Desenhe sua assinatura.');
      await jsonRequest(endpoints.handwritten(current.session_id), 'POST', { width: 280, height: 180, strokes });
    } else {
      const payload = await deviceSigning.sign(current.payload_base64);
      activeSession();
      await jsonRequest(endpoints.biometric(current.session_id), 'POST', payload);
    }
    setSession(null); setConsented(false); setStrokes([]); setMessage('Assinatura registrada. O documento final pode levar alguns instantes para ficar disponível.'); await refresh();
  };
  return <PageCard><View style={{ gap: 12 }}>
    <Text style={{ fontSize: 22, fontWeight: '700', color: '#12355B' }}>{doc.title}</Text><Text>{doc.description}</Text><Text>Status: {doc.status} · Versão {doc.current_version.version}</Text>
    <Text selectable>Hash: {doc.current_version.sha256}</Text>
    {!!(message || versions.error || signers.error) && <Text accessibilityRole="alert">{message || versions.error || signers.error}</Text>}
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <AppButton title="Baixar original" disabled={busy} onPress={() => void run(() => downloadDocument(doc.id, 'original'))} />
      <AppButton title="Baixar assinado" disabled={busy} onPress={() => void run(() => downloadDocument(doc.id, 'final'))} />
      <AppButton title="Baixar evidências" disabled={busy} onPress={() => void run(() => downloadDocument(doc.id, 'evidence'))} />
    </View>
    <Text style={{ fontSize: 18, fontWeight: '700' }}>Versões</Text>
    {versions.items.map(version => <Text key={version.id}>v{version.version} · {version.original_filename}{version.is_locked ? ' · Bloqueada' : ''}</Text>)}
    <AppButton title="Enviar nova versão PDF" disabled={busy || !!session} onPress={() => void run(async () => { if (await uploadPdf(doc.id)) await refresh(); })} />
    <Text style={{ fontSize: 18, fontWeight: '700' }}>Signatários</Text>
    {signers.items.map(signer => <View key={signer.id} style={{ gap: 6 }}><Text>Usuário {signer.usuario_id} · {signer.status}</Text><AppButton title="Remover signatário" variant="danger" disabled={busy || !!session} onPress={() => void run(async () => { await jsonRequest(endpoints.signer(doc.id, signer.id), 'DELETE'); await signers.refresh(); })} /></View>)}
    <FormField label="ID do usuário signatário" keyboardType="numeric" value={userId} onChangeText={setUserId} /><FormField label="Ordem de assinatura (opcional)" keyboardType="numeric" value={order} onChangeText={setOrder} />
    <AppButton title="Adicionar signatário" disabled={busy || !!session} onPress={() => void run(async () => {
      if (!/^\d+$/.test(userId) || Number(userId) < 1) throw new Error('Informe um ID de usuário válido.');
      if (order && (!/^\d+$/.test(order) || Number(order) < 1)) throw new Error('Informe uma ordem válida.');
      await jsonRequest(endpoints.signers(doc.id), 'POST', { user_id: Number(userId), ...(order ? { signature_order: Number(order) } : {}) }); setUserId(''); setOrder(''); await signers.refresh();
    })} />
    <AppButton title={session ? 'Reiniciar sessão de assinatura' : 'Iniciar assinatura'} disabled={busy} onPress={() => void run(async () => {
      setSession(null); setConsented(false); setStrokes([]);
      const latest = await getDocument(doc.id);
      const started = await jsonRequest<SignatureSession>(endpoints.startSignature(doc.id), 'POST');
      setDoc(latest);
      if (started.document_hash !== latest.current_version.sha256) throw new Error('O documento mudou. Atualize e revise a versão antes de assinar.');
      setSession(started);
    })} />
    {session && <View style={{ gap: 12 }}><Text selectable>{session.consent.text}</Text><Text>Validade da sessão: {new Date(session.expires_at).toLocaleString('pt-BR')}</Text>
      <AppButton title={consented ? 'Consentimento registrado' : 'Li e aceito o consentimento'} disabled={busy || consented} onPress={() => void run(async () => { const s = activeSession(); await jsonRequest(endpoints.consent(s.session_id), 'POST', { accepted: true, consent_version: s.consent.version }); setConsented(true); })} />
      <SignaturePad strokes={strokes} onChange={setStrokes} disabled={busy || !consented} />
      <AppButton title="Limpar assinatura" variant="secondary" disabled={busy} onPress={() => setStrokes([])} />
      <AppButton title="Confirmar assinatura manuscrita" disabled={busy || !consented || !strokes.length} onPress={() => void run(() => complete('handwritten'))} />
      <AppButton title="Assinar com biometria" disabled={busy || !consented || !deviceSigning.available()} onPress={() => void run(() => complete('biometric'))} />
    </View>}
    <AppButton title="Atualizar documento" disabled={busy} onPress={() => void run(refresh)} /><AppButton title="Fechar documento" variant="secondary" disabled={busy} onPress={onClose} />
  </View></PageCard>;
}
