import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppButton, PageCard } from './ui';
import { apiFetch } from '../src/api/client';
import { endpoints } from '../src/api/endpoints';
import { useApiCollection } from '../src/hooks/useApiCollection';

type ImportStatus = 'Pendente' | 'Importada' | 'Com erro';
type InvoiceItem = { id: number; code: string; description: string; ncm: string; cfop: string; unit: string; quantity: string; unitPrice: string; total: number };
type Purchase = { id: number; number: string; series: string; accessKey: string; issueDate: string; entryDate: string; supplier: string; supplierCnpj: string; operation: string; paymentMethod: string; importStatus: ImportStatus; productsTotal: number; discount: number; freight: number; otherExpenses: number; icms: number; ipi: number; pis: number; cofins: number; invoiceTotal: number; items: InvoiceItem[] };

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const asNumber = (value: string) => Number(value.replace(',', '.')) || 0;

export function PurchaseScreen() {
  const [selectedXmlName, setSelectedXmlName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { items: purchases, loading: isLoadingPurchases, refresh, isOffline } = useApiCollection<Purchase>('purchases', endpoints.purchases);

  const importXml = async () => {
    const selection = await DocumentPicker.getDocumentAsync({ type: ['application/xml', 'text/xml'], copyToCacheDirectory: true });
    if (selection.canceled) return;
    const file = selection.assets[0];
    if (!file.name.toLowerCase().endsWith('.xml')) { Alert.alert('Arquivo inválido', 'Selecione o arquivo XML da nota fiscal eletrônica.'); return; }
    setSelectedXmlName(file.name); setIsImporting(true);
    try {
      const formData = new FormData();
      if (file.file) formData.append('xml', file.file);
      else formData.append('xml', { uri: file.uri, name: file.name, type: file.mimeType || 'application/xml' } as never);
      if (isOffline) throw new Error('A importação de XML precisa de conexão. Tente novamente quando estiver online.');
      const payload = await apiFetch<Purchase | { purchase: Purchase; message?: string }>(`${endpoints.purchases}/importar-xml`, { method: 'POST', body: formData });
      const purchase = 'purchase' in payload ? payload.purchase : payload as Purchase;
      if (!purchase?.id || !Array.isArray(purchase.items)) throw new Error('O backend não retornou uma nota fiscal válida.');
      await refresh();
      Alert.alert('Nota fiscal importada', 'Os dados, itens e totais foram gravados e carregados com sucesso.');
    } catch (error) { Alert.alert('Não foi possível importar o XML', error instanceof Error ? error.message : 'Verifique a conexão com o backend e tente novamente.'); }
    finally { setIsImporting(false); }
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard><Text style={styles.title}>Importar nota fiscal</Text><Text style={styles.description}>Selecione o XML da NF-e para que o backend valide os dados, cadastre a compra e seus itens no banco de dados.</Text>
      <View style={styles.importBox}><View style={styles.importCopy}><Text style={styles.importTitle}>Arquivo XML da NF-e</Text><Text style={styles.importText}>{selectedXmlName || 'Nenhum arquivo selecionado.'}</Text></View><AppButton title={isImporting ? 'Importando XML...' : 'Selecionar e importar XML'} onPress={importXml} /></View>
      <Text style={styles.integrationHint}>O arquivo é enviado ao backend em POST {`{EXPO_PUBLIC_API_URL}`}/compras/importar-xml, no campo multipart “xml”.</Text>
    </PageCard>
    <PageCard><View style={styles.listHeading}><View style={styles.listCopy}><Text style={styles.title}>Notas fiscais importadas</Text><Text style={styles.description}>{isOffline ? 'Exibindo dados salvos no dispositivo.' : 'Dados, itens, quantidades e valores retornados pelo backend após a importação.'}</Text></View><AppButton title="Atualizar lista" variant="secondary" onPress={() => void refresh()} /></View>
      {isLoadingPurchases ? <View style={styles.emptyPurchase}><Text style={styles.emptyText}>Carregando notas fiscais importadas...</Text></View> : purchases.length === 0 ? <View style={styles.emptyPurchase}><Text style={styles.emptyText}>Nenhuma nota fiscal importada.</Text></View> : purchases.map((purchase) => <PurchaseDetails key={purchase.id} purchase={purchase} />)}
    </PageCard>
  </ScrollView>;
}

function PurchaseDetails({ purchase }: { purchase: Purchase }) { return <View style={styles.purchaseCard}><View style={styles.purchaseHeading}><View><Text style={styles.invoiceName}>NF {purchase.number}{purchase.series ? ` · Série ${purchase.series}` : ''}</Text><Text style={styles.supplierName}>{purchase.supplier}</Text></View><Text style={[styles.statusBadge, purchase.importStatus === 'Importada' ? styles.imported : purchase.importStatus === 'Com erro' ? styles.error : styles.pending]}>{purchase.importStatus}</Text></View>
  <View style={styles.infoGrid}><Info label="Emissão" value={purchase.issueDate} /><Info label="Entrada" value={purchase.entryDate} /><Info label="CNPJ" value={purchase.supplierCnpj || '-'} /><Info label="Operação" value={purchase.operation || '-'} /><Info label="Pagamento" value={purchase.paymentMethod || '-'} /><Info label="Chave de acesso" value={purchase.accessKey || '-'} /></View><InvoiceItemsTable items={purchase.items} /><View style={styles.totalsRow}><Info label="Produtos" value={money(purchase.productsTotal)} /><Info label="Desconto" value={money(purchase.discount)} /><Info label="Frete" value={money(purchase.freight)} /><Info label="Outras despesas" value={money(purchase.otherExpenses)} /><Info label="ICMS" value={money(purchase.icms)} /><Info label="IPI" value={money(purchase.ipi)} /><Info label="PIS" value={money(purchase.pis)} /><Info label="COFINS" value={money(purchase.cofins)} /><Info label="Total da nota" value={money(purchase.invoiceTotal)} emphasis /></View></View>; }
function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) { const labels = ['Código', 'Descrição', 'NCM', 'CFOP', 'Un.', 'Qtd.', 'Valor unit.', 'Total']; return <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false}><View><View style={[styles.row, styles.tableHeader]}>{labels.map((label) => <Text key={label} style={[styles.cell, styles.headerCell, label === 'Descrição' && styles.descriptionCell]}>{label}</Text>)}</View>{items.map((item) => <View key={item.id} style={styles.row}><Text style={styles.cell}>{item.code || '-'}</Text><Text style={[styles.cell, styles.descriptionCell]}>{item.description}</Text><Text style={styles.cell}>{item.ncm || '-'}</Text><Text style={styles.cell}>{item.cfop || '-'}</Text><Text style={styles.cell}>{item.unit}</Text><Text style={styles.cell}>{item.quantity}</Text><Text style={styles.cell}>{money(asNumber(item.unitPrice))}</Text><Text style={styles.cell}>{money(item.total)}</Text></View>)}</View></ScrollView></View>; }
function Info({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, emphasis && styles.infoEmphasis]}>{value}</Text></View>; }

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 16, maxWidth: 1272, padding: 16, width: '100%' }, title: { color: '#075A35', fontSize: 24, fontWeight: '700' }, description: { color: '#62746A', fontSize: 14, lineHeight: 21, marginBottom: 18, marginTop: 6 }, listHeading: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }, listCopy: { flexGrow: 1 }, importBox: { alignItems: 'center', backgroundColor: '#F4F8F5', borderColor: '#A9CDB6', borderRadius: 10, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', padding: 16 }, importCopy: { flexGrow: 1 }, importTitle: { color: '#075A35', fontSize: 16, fontWeight: '700' }, importText: { color: '#62746A', fontSize: 14, marginTop: 4 }, integrationHint: { color: '#62746A', fontSize: 12, marginTop: 10 }, emptyPurchase: { alignItems: 'center', borderColor: '#D5E0D9', borderWidth: 1, justifyContent: 'center', minHeight: 90, padding: 16 }, emptyText: { color: '#62746A', fontSize: 14, textAlign: 'center' }, purchaseCard: { borderColor: '#D5E0D9', borderRadius: 10, borderWidth: 1, marginTop: 14, overflow: 'hidden', padding: 16 }, purchaseHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' }, invoiceName: { color: '#075A35', fontSize: 18, fontWeight: '800' }, supplierName: { color: '#62746A', fontSize: 14, marginTop: 3 }, statusBadge: { borderRadius: 14, fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 }, pending: { backgroundColor: '#FFF3D4', color: '#895C05' }, imported: { backgroundColor: '#DFF2E5', color: '#086438' }, error: { backgroundColor: '#FDE4E0', color: '#A92D24' }, infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16 }, info: { flexBasis: 145, flexGrow: 1 }, infoLabel: { color: '#62746A', fontSize: 12 }, infoValue: { color: '#23362B', fontSize: 14, fontWeight: '600', marginTop: 3 }, infoEmphasis: { color: '#075A35', fontSize: 16, fontWeight: '800' }, table: { borderColor: '#D5E0D9', borderWidth: 1, marginTop: 14 }, row: { flexDirection: 'row', minHeight: 46 }, tableHeader: { backgroundColor: '#14653B', minHeight: 36 }, cell: { borderRightColor: '#D5E0D9', borderRightWidth: 1, color: '#23362B', fontSize: 13, minWidth: 92, paddingHorizontal: 9, paddingTop: 12 }, descriptionCell: { minWidth: 240 }, headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 9 }, totalsRow: { backgroundColor: '#F4F8F5', flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14, padding: 12 },
});
