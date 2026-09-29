import { session } from './session';
export async function downloadAuthorization(url: string) {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base || new URL(url).origin !== new URL(base).origin) throw new Error('O servidor retornou uma URL de download fora da origem configurada.');
  const token = await session.getAccessToken();
  if (!token) throw new Error('Entre novamente para baixar o documento.');
  return { Authorization: `Bearer ${token}` };
}
