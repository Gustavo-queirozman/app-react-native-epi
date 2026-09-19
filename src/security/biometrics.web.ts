import { session } from '../api/session';
import type { BiometricResult, BiometricService } from './biometrics.types';

const CREDENTIAL_ID_KEY = 'gestao-epi.web-authn-credential-id';

function randomBytes(length: number) { const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return bytes; }
function getCredentialId() { const value = localStorage.getItem(CREDENTIAL_ID_KEY); return value ? Uint8Array.from(atob(value), (character) => character.charCodeAt(0)) : null; }
function storeCredentialId(id: ArrayBuffer) { localStorage.setItem(CREDENTIAL_ID_KEY, btoa(String.fromCharCode(...new Uint8Array(id)))); }

async function verifyUser(action: string): Promise<BiometricResult> {
  if (!window.PublicKeyCredential || !navigator.credentials) return { success: false, message: 'Seu navegador não oferece suporte a passkeys/WebAuthn.' };
  const credentialId = getCredentialId();
  if (!credentialId) return { success: false, message: 'Ative a biometria ao entrar com e-mail e senha neste navegador.' };
  try {
    const credential = await navigator.credentials.get({ publicKey: { challenge: randomBytes(32), allowCredentials: [{ id: credentialId, type: 'public-key' }], userVerification: 'required', timeout: 60_000 } });
    return credential ? { success: true } : { success: false, message: `${action} não foi confirmado.` };
  } catch { return { success: false, message: `${action} não foi confirmado.` }; }
}

export const biometrics: BiometricService = {
  canUseForLogin: async () => Boolean(getCredentialId() && await session.getBiometricAccessToken()),
  enableLogin: async (email, token) => {
    if (!window.PublicKeyCredential || !navigator.credentials) return { success: false, message: 'Seu navegador não oferece suporte a passkeys/WebAuthn.' };
    try {
      const credential = await navigator.credentials.create({ publicKey: {
        challenge: randomBytes(32), rp: { name: 'Gestão EPI' }, user: { id: randomBytes(32), name: email, displayName: email },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'required', userVerification: 'required' }, timeout: 60_000, attestation: 'none',
      } });
      if (!credential) return { success: false, message: 'Não foi possível ativar a biometria neste navegador.' };
      storeCredentialId((credential as PublicKeyCredential).rawId);
      await session.setBiometricAccess(email, token);
      return { success: true };
    } catch { return { success: false, message: 'A ativação da biometria foi cancelada ou não está disponível.' }; }
  },
  authenticateLogin: async () => {
    const token = await session.getBiometricAccessToken();
    if (!token) return { success: false, message: 'Entre com e-mail e senha para ativar a biometria neste navegador.' };
    const result = await verifyUser('O acesso biométrico');
    if (result.success) await session.setAccessToken(token);
    return result;
  },
  authenticateDocumentSignature: () => verifyUser('A assinatura biométrica'),
};
