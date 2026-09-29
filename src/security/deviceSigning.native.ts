import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { apiFetch } from '../api/client';
import { endpoints } from '../api/endpoints';
import { jsonRequest, unwrap, type Profile } from '../api/resources';
import { bytesToHex, hexToBytes, publicKeyPem, signPayload, validPrivateKey } from './signatureCrypto';
const options: SecureStore.SecureStoreOptions = { requireAuthentication: true, authenticationPrompt: 'Autorizar assinatura de documento', keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const scope = async () => {
  const profile = unwrap(await apiFetch<Profile | { data: Profile }>(endpoints.auth.profile));
  const server = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, process.env.EXPO_PUBLIC_API_URL ?? '');
  return `handsafe.signing.${server}.${profile.id}`;
};
export const deviceSigning = {
  available: () => SecureStore.canUseBiometricAuthentication(),
  register: async () => {
    if (!SecureStore.canUseBiometricAuthentication()) throw new Error('Biometria protegida indisponível. Use um dispositivo com biometria cadastrada e um development build.');
    const key = await scope();
    if (await SecureStore.getItemAsync(key + '.device')) throw new Error('Este aparelho já está registrado. Revogue o registro atual antes de cadastrar novamente.');
    let secret = await Crypto.getRandomBytesAsync(32);
    while (!validPrivateKey(secret)) secret = await Crypto.getRandomBytesAsync(32);
    const uuid = Crypto.randomUUID();
    const secretKey = key + '.' + uuid;
    try {
      await SecureStore.setItemAsync(secretKey, bytesToHex(secret), options);
      const result = unwrap(await jsonRequest<{ data: { id: string } }>(endpoints.registerDevice, 'POST', { device_uuid: uuid, device_name: `Handsafe ${Platform.OS}`, platform: Platform.OS, public_key: publicKeyPem(secret), algorithm: 'ECDSA_P256_SHA256' }));
      await SecureStore.setItemAsync(key + '.device', JSON.stringify({ id: result.id, secretKey }));
    } finally { secret.fill(0); }
  },
  sign: async (payload: string) => {
    const key = await scope();
    const stored = await SecureStore.getItemAsync(key + '.device');
    if (!stored) throw new Error('Cadastre este aparelho na área Dispositivos antes de assinar.');
    const device = JSON.parse(stored) as { id: string; secretKey: string };
    const value = await SecureStore.getItemAsync(device.secretKey, options);
    if (!value) throw new Error('Chave indisponível ou biometria alterada. Revogue o dispositivo e cadastre-o novamente.');
    const secret = hexToBytes(value);
    try { return { device_id: device.id, signature: signPayload(secret, payload), algorithm: 'ECDSA_P256_SHA256' }; }
    finally { secret.fill(0); }
  },
  remove: async (id: string) => {
    const key = await scope();
    const stored = await SecureStore.getItemAsync(key + '.device');
    if (!stored) return;
    const device = JSON.parse(stored) as { id: string; secretKey: string };
    if (device.id === id) { await SecureStore.deleteItemAsync(device.secretKey); await SecureStore.deleteItemAsync(key + '.device'); }
  },
};
