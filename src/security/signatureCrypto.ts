import { p256 } from '@noble/curves/nist.js';
import { bytesToHex, hexToBytes } from '@noble/curves/utils.js';
export { bytesToHex, hexToBytes };
export const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
export const fromBase64 = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
export const validPrivateKey = (bytes: Uint8Array) => p256.utils.isValidSecretKey(bytes);
export function publicKeyPem(privateKey: Uint8Array) {
  // SubjectPublicKeyInfo for id-ecPublicKey + prime256v1, uncompressed point.
  const prefix = hexToBytes('3059301306072a8648ce3d020106082a8648ce3d030107034200');
  const point = p256.getPublicKey(privateKey, false);
  const der = new Uint8Array(prefix.length + point.length);
  der.set(prefix); der.set(point, prefix.length);
  return `-----BEGIN PUBLIC KEY-----\n${toBase64(der).match(/.{1,64}/g)!.join('\n')}\n-----END PUBLIC KEY-----`;
}
export function signPayload(privateKey: Uint8Array, payload: string) {
  return toBase64(p256.sign(fromBase64(payload), privateKey, { prehash: true, format: 'der' }));
}
