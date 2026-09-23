import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'handsafe.access-token';
const BIOMETRIC_ACCESS_TOKEN_KEY = 'handsafe.biometric-access-token';
const BIOMETRIC_EMAIL_KEY = 'handsafe.biometric-email';

const isWeb = Platform.OS === 'web';

const storage = {
  getItem: (key: string) => isWeb ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => {
    if (isWeb) {
      globalThis.localStorage?.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: (key: string) => {
    if (isWeb) {
      globalThis.localStorage?.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const session = {
  getAccessToken: () => storage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => storage.setItem(ACCESS_TOKEN_KEY, token),
  setBiometricAccess: async (email: string, token: string) => {
    await Promise.all([
      storage.setItem(BIOMETRIC_ACCESS_TOKEN_KEY, token),
      storage.setItem(BIOMETRIC_EMAIL_KEY, email),
    ]);
  },
  getBiometricAccessToken: () => storage.getItem(BIOMETRIC_ACCESS_TOKEN_KEY),
  getBiometricEmail: () => storage.getItem(BIOMETRIC_EMAIL_KEY),
  clear: () => Promise.all([
    storage.deleteItem(ACCESS_TOKEN_KEY),
    storage.deleteItem(BIOMETRIC_ACCESS_TOKEN_KEY),
    storage.deleteItem(BIOMETRIC_EMAIL_KEY),
  ]).then(() => undefined),
};
