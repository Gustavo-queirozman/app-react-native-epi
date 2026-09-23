import * as LocalAuthentication from 'expo-local-authentication';
import { session } from '../api/session';
import type { BiometricResult, BiometricService } from './biometrics.types';

async function authenticate(promptMessage: string): Promise<BiometricResult> {
  const [hasHardware, isEnrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
  if (!hasHardware) return { success: false, message: 'Este dispositivo não possui biometria disponível.' };
  if (!isEnrolled) return { success: false, message: 'Cadastre uma digital ou Face ID nas configurações do dispositivo para continuar.' };
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptDescription: 'Confirme sua identidade para o Handsafe.',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: true,
    biometricsSecurityLevel: 'strong',
  });
  return result.success ? { success: true } : { success: false, message: 'A confirmação biométrica não foi concluída.' };
}

export const biometrics: BiometricService = {
  canUseForLogin: async () => Boolean(await session.getBiometricAccessToken()),
  enableLogin: async (email, token) => {
    const result = await authenticate('Ativar acesso biométrico');
    if (!result.success) return result;
    await session.setBiometricAccess(email, token);
    return { success: true };
  },
  authenticateLogin: async () => {
    const token = await session.getBiometricAccessToken();
    if (!token) return { success: false, message: 'Entre com e-mail e senha para ativar a biometria neste dispositivo.' };
    const result = await authenticate('Entrar com biometria');
    if (result.success) await session.setAccessToken(token);
    return result;
  },
  authenticateDocumentSignature: () => authenticate('Assinar documento'),
};
