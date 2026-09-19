import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'gestao-epi.access-token';
const BIOMETRIC_ACCESS_TOKEN_KEY = 'gestao-epi.biometric-access-token';
const BIOMETRIC_EMAIL_KEY = 'gestao-epi.biometric-email';

export const session = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  setBiometricAccess: async (email: string, token: string) => {
    await Promise.all([
      SecureStore.setItemAsync(BIOMETRIC_ACCESS_TOKEN_KEY, token),
      SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email),
    ]);
  },
  getBiometricAccessToken: () => SecureStore.getItemAsync(BIOMETRIC_ACCESS_TOKEN_KEY),
  getBiometricEmail: () => SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY),
  clear: () => Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(BIOMETRIC_ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY),
  ]).then(() => undefined),
};
