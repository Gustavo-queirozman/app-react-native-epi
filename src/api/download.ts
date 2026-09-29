import { downloadAuthorization } from './downloadAuth';
export async function downloadFile(url: string, filename: string) {
  const response = await fetch(url, { headers: await downloadAuthorization(url), redirect: 'error' });
  if (!response.ok) throw new Error(`Não foi possível baixar o arquivo (${response.status}).`);
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
