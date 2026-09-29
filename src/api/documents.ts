import { getDocumentAsync } from 'expo-document-picker';
import { apiFetch } from './client';
import { endpoints } from './endpoints';
import { jsonRequest, unwrap } from './resources';
import { downloadFile } from './download';
export type DocumentVersion = { id: string; version: number; original_filename: string; sha256: string; is_locked: boolean };
export type SignatureDocument = { id: string; title: string; description: string | null; status: string; current_version: DocumentVersion };
export type Signer = { id: string; usuario_id: number; ordem_assinatura: number | null; status: string };
export type SignatureSession = { session_id: string; document_id: string; document_hash: string; payload_base64: string; expires_at: string; consent: { version: string; text: string } };
export type Device = { id: string; nome: string | null; plataforma: string; revogado_em: string | null };
export async function uploadPdf(documentId?: string, title?: string, description?: string) {
  const selection = await getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (selection.canceled) return false;
  const file = selection.assets[0];
  const form = new FormData();
  if (file.file) form.append('file', file.file);
  else form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as never);
  if (!documentId) { form.append('title', title ?? file.name); form.append('description', description ?? ''); }
  await apiFetch(documentId ? endpoints.versions(documentId) : endpoints.documents, { method: 'POST', body: form });
  return true;
}
export async function downloadDocument(id: string, kind: 'original' | 'final' | 'evidence') {
  const response = await jsonRequest<{ url: string }>(endpoints.downloadUrl(id), 'POST', { kind });
  await downloadFile(response.url, kind === 'evidence' ? 'evidencias.json' : 'documento.pdf');
}
export const getDocument = async (id: string) => unwrap(await apiFetch<SignatureDocument | { data: SignatureDocument }>(endpoints.document(id)));
