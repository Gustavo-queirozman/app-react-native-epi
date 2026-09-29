import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, FormField, PageCard } from './ui';
import { apiFetch } from '../src/api/client';
import { endpoints } from '../src/api/endpoints';
import { jsonRequest, unwrap, type Invoice } from '../src/api/resources';
import { useRemoteList } from '../src/hooks/useRemoteList';

export function PurchaseScreen() {
  const remote = useRemoteList<Invoice>(endpoints.purchases);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha na operação.'); }
    finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
    <PageCard><Text style={{ fontSize: 24, color: '#12355B', fontWeight: '700' }}>Notas fiscais</Text>
      <Text>Importe a NF-e pela chave de acesso de 44 dígitos.</Text>
      <FormField label="Chave de acesso" keyboardType="numeric" maxLength={44} value={key} onChangeText={setKey} />
      <AppButton title={busy ? 'Aguarde...' : 'Importar nota fiscal'} disabled={busy} onPress={() => void run(async () => {
        if (!/^\d{44}$/.test(key.trim())) throw new Error('Informe uma chave com 44 dígitos.');
        const invoice = unwrap(await jsonRequest<Invoice | { data: Invoice }>(endpoints.importInvoice, 'POST', { chave: key.trim() }));
        setSelected(invoice); setKey(''); setMessage('Nota fiscal importada.'); await remote.refresh();
      })} />
      {!!(message || remote.error) && <Text accessibilityRole="alert">{message || remote.error}</Text>}
    </PageCard>
    <PageCard><AppButton title="Atualizar notas" disabled={busy || remote.loading} onPress={remote.refresh} />
      {remote.loading && <Text>Carregando...</Text>}
      {!remote.loading && !remote.items.length && <Text>Nenhuma nota fiscal encontrada.</Text>}
      {remote.items.map(invoice => <View key={invoice.id} style={{ gap: 8, paddingVertical: 12 }}><Text selectable>Chave: {invoice.chave}</Text><AppButton title="Consultar nota" disabled={busy} onPress={() => void run(async () => setSelected(unwrap(await apiFetch<Invoice | { data: Invoice }>(endpoints.invoice(invoice.id)))))} /></View>)}
    </PageCard>
    {selected && <PageCard><Text style={{ fontSize: 20 }}>Detalhes da nota</Text><Text selectable>{selected.chave}</Text><InvoiceValues value={selected.dados} /></PageCard>}
  </ScrollView>;
}
function InvoiceValues({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <Text>—</Text>;
  if (typeof value !== 'object') return <Text selectable>{String(value)}</Text>;
  return <View style={{ paddingLeft: 10, gap: 8 }}>{Object.entries(value).map(([key, item]) => <View key={key}><Text style={{ fontWeight: '700', color: '#12355B' }}>{key.replace(/_/g, ' ')}</Text><InvoiceValues value={item} /></View>)}</View>;
}
