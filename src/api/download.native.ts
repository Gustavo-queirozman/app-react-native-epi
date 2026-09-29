import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { downloadAuthorization } from './downloadAuth';
export async function downloadFile(url: string, filename: string) {
  const file = new File(Paths.cache, `${Date.now()}-${filename}`);
  try {
    await File.downloadFileAsync(url, file, { headers: await downloadAuthorization(url) });
    if (!(await Sharing.isAvailableAsync())) throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
    await Sharing.shareAsync(file.uri, { mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'application/json' });
  } finally { if (file.exists) file.delete(); }
}
