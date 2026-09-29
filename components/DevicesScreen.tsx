import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, PageCard } from './ui';
import { endpoints } from '../src/api/endpoints';
import { jsonRequest } from '../src/api/resources';
import { type Device } from '../src/api/documents';
import { useRemoteList } from '../src/hooks/useRemoteList';
import { deviceSigning } from '../src/security/deviceSigning';
export function DevicesScreen() {
  const remote = useRemoteList<Device>(endpoints.devices);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); await remote.refresh(); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Falha na operação.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}><PageCard><Text style={{ fontSize: 24, fontWeight: '700', color: '#12355B' }}>Dispositivos de assinatura</Text>
    <Text>Cadastre este aparelho para autorizar assinaturas com sua biometria.</Text>
    {!deviceSigning.available() && <Text>O cadastro exige biometria disponível no aplicativo Android/iOS. Use um development build em aparelho físico.</Text>}
    <AppButton title="Cadastrar este aparelho" disabled={busy || !deviceSigning.available()} onPress={() => void run(deviceSigning.register)} />
    <AppButton title="Atualizar dispositivos" disabled={busy || remote.loading} onPress={remote.refresh} />
    {!!(message || remote.error) && <Text accessibilityRole="alert">{message || remote.error}</Text>}
    {remote.loading && <Text>Carregando...</Text>}
    {!remote.loading && !remote.items.length && <Text>Nenhum dispositivo registrado.</Text>}
    {remote.items.map(device => <View key={device.id} style={{ gap: 8, paddingVertical: 12 }}><Text>{device.nome || device.plataforma} · {device.revogado_em ? 'Revogado' : 'Ativo'}</Text>
      {!device.revogado_em && <AppButton title="Revogar dispositivo" variant="danger" disabled={busy} onPress={() => void run(async () => { await jsonRequest(endpoints.device(device.id), 'DELETE'); await deviceSigning.remove(device.id); })} />}
    </View>)}
  </PageCard></ScrollView>;
}
