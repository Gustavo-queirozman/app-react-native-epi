export type BiometricResult = { success: true } | { success: false; message: string };

export type BiometricService = {
  canUseForLogin: () => Promise<boolean>;
  enableLogin: (email: string, token: string) => Promise<BiometricResult>;
  authenticateLogin: () => Promise<BiometricResult>;
  authenticateDocumentSignature: () => Promise<BiometricResult>;
};
