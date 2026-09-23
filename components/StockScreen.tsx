import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppButton, FormField, PageCard, SelectField } from './ui';

type Movement = { id: number; date: string; type: string; epi: string; quantity: number; responsibleOrReason: string };
const epiOptions = ['Selecione', 'Capacete — CA 10 — estoque 99', 'Luva de proteção — estoque 0', 'Óculos de segurança — estoque 0'];
const reasonOptions = ['Perda', 'Avaria', 'Descarte', 'Correção'];
const headers = ['Data', 'Tipo', 'EPI', 'Quantidade', 'Responsável ou motivo'];
const displayEpi = (value: string) => value.split(' — ')[0];
const now = () => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date());

export function StockScreen() {
  const { width } = useWindowDimensions();
  const isSingleColumn = width < 960;
  const isNarrow = width < 540;
  const useMovementCards = width < 640;
  const tableWidth = Math.max(860, Math.min(width - 64, 1208));
  const [entryEpi, setEntryEpi] = useState(epiOptions[1]);
  const [entryQuantity, setEntryQuantity] = useState('1');
  const [invoice, setInvoice] = useState('');
  const [supplierOrLot, setSupplierOrLot] = useState('');
  const [exitEpi, setExitEpi] = useState(epiOptions[0]);
  const [exitQuantity, setExitQuantity] = useState('1');
  const [reason, setReason] = useState(reasonOptions[0]);
  const [movements, setMovements] = useState<Movement[]>([
    { id: 1, date: '16/09/2026, 20:20:43', type: 'Saída automática por entrega', epi: 'Capacete', quantity: 1, responsibleOrReason: 'gustavo' },
    { id: 2, date: '16/09/2026, 20:20:33', type: 'Entrada', epi: 'Capacete', quantity: 100, responsibleOrReason: '-' },
  ]);
  const registerEntry = () => { const quantity = Number(entryQuantity); if (!Number.isFinite(quantity) || quantity <= 0) return Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.'); setMovements((current) => [{ id: Date.now(), date: now(), type: 'Entrada', epi: displayEpi(entryEpi), quantity, responsibleOrReason: supplierOrLot.trim() || invoice.trim() || '-' }, ...current]); setEntryQuantity('1'); setInvoice(''); setSupplierOrLot(''); };
  const registerExit = () => { const quantity = Number(exitQuantity); if (exitEpi === 'Selecione') return Alert.alert('Selecione um EPI', 'Escolha o EPI antes de registrar a saída.'); if (!Number.isFinite(quantity) || quantity <= 0) return Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.'); setMovements((current) => [{ id: Date.now(), date: now(), type: 'Saída manual', epi: displayEpi(exitEpi), quantity, responsibleOrReason: reason }, ...current]); setExitEpi('Selecione'); setExitQuantity('1'); setReason(reasonOptions[0]); };

  return <ScrollView contentContainerStyle={[styles.content, isSingleColumn && styles.compactContent]} keyboardShouldPersistTaps="handled">
    <View style={[styles.formsRow, isSingleColumn && styles.formsColumn]}>
      <PageCard style={[styles.formCard, isSingleColumn && styles.stackedFormCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.eyebrow}>REPOSIÇÃO</Text>
            <Text style={styles.title}>Entrada de estoque</Text>
            <Text style={styles.cardDescription}>Registre itens recebidos e mantenha o saldo atualizado.</Text>
            </View><View style={[styles.statusPill, styles.entryPill]}>
              <Text style={styles.statusPillText}>Entrada</Text>
              </View>
              </View>
        <View style={styles.formSection}>
          <SelectField label="EPI" value={entryEpi} options={epiOptions.slice(1)} onValueChange={setEntryEpi} containerStyle={styles.stockField} />
          <View style={[styles.fieldRow, isNarrow && styles.fieldsColumn]}><FormField label="Quantidade" value={entryQuantity} onChangeText={setEntryQuantity} keyboardType="numeric" containerStyle={[styles.halfField, isNarrow && styles.fullField]} /><FormField label="Nota fiscal" placeholder="Número da NF" value={invoice} onChangeText={setInvoice} containerStyle={[styles.halfField, isNarrow && styles.fullField]} /></View><FormField label="Fornecedor ou lote" placeholder="Fornecedor ou lote" value={supplierOrLot} onChangeText={setSupplierOrLot} containerStyle={styles.stockField} /></View>
        <View style={styles.cardFooter}><Text style={styles.footerHint}>Os campos de nota e lote são opcionais.</Text><View style={styles.buttonRow}><AppButton title="Registrar entrada" onPress={registerEntry} /></View></View>
      </PageCard>
      <PageCard style={[styles.formCard, isSingleColumn && styles.stackedFormCard]}>
        <View style={styles.cardHeader}><View style={styles.cardHeaderText}><Text style={styles.eyebrow}>CONTROLE DE BAIXAS</Text><Text style={styles.title}>Ajuste manual de saída</Text><Text style={styles.cardDescription}>Registre perdas, avarias, descartes ou correções de saldo.</Text></View><View style={[styles.statusPill, styles.exitPill]}><Text style={[styles.statusPillText, styles.exitPillText]}>Saída</Text></View></View>
        <View style={styles.notice}><Text style={styles.noticeText}>As entregas já baixam o estoque automaticamente.</Text></View>
        <View style={[styles.formSection, styles.exitFormSection]}><SelectField label="EPI" value={exitEpi} options={epiOptions} onValueChange={setExitEpi} containerStyle={styles.stockField} /><View style={[styles.fieldRow, isNarrow && styles.fieldsColumn]}><FormField label="Quantidade" value={exitQuantity} onChangeText={setExitQuantity} keyboardType="numeric" containerStyle={[styles.halfField, isNarrow && styles.fullField]} /><SelectField label="Motivo" value={reason} options={reasonOptions} onValueChange={setReason} containerStyle={[styles.halfField, isNarrow && styles.fullField]} /></View></View>
        <View style={styles.cardFooter}><Text style={styles.footerHint}>Confira o EPI e o motivo antes de confirmar.</Text><View style={styles.buttonRow}><AppButton title="Registrar saída" onPress={registerExit} /></View></View>
      </PageCard>
    </View>
    <PageCard style={styles.movementsCard}><View style={styles.movementsHeader}><View><Text style={styles.eyebrow}>HISTÓRICO</Text><Text style={styles.movementsTitle}>Movimentações</Text></View><View style={styles.countPill}><Text style={styles.countPillText}>{movements.length} registros</Text></View></View>{useMovementCards ? <View style={styles.movementList}>{movements.map((movement) => <View key={movement.id} style={styles.movementItem}><MovementDetail label="Data" value={movement.date} /><MovementDetail label="Tipo" value={movement.type} /><MovementDetail label="EPI" value={movement.epi} /><MovementDetail label="Quantidade" value={String(movement.quantity)} /><MovementDetail label="Responsável ou motivo" value={movement.responsibleOrReason} /></View>)}</View> : <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}><View style={[styles.tableContent, { width: tableWidth }]}><View style={[styles.row, styles.tableHeader]}>{headers.map((header) => <Text key={header} style={[styles.cell, styles.headerCell]}>{header}</Text>)}</View>{movements.map((movement, index) => <View key={movement.id} style={[styles.row, index % 2 === 1 && styles.alternateRow]}><Text style={styles.cell}>{movement.date}</Text><Text style={styles.cell}>{movement.type}</Text><Text style={styles.cell}>{movement.epi}</Text><Text style={styles.cell}>{movement.quantity}</Text><Text style={styles.cell}>{movement.responsibleOrReason}</Text></View>)}</View></ScrollView></View>}</PageCard>
  </ScrollView>;
}
function MovementDetail({ label, value }: { label: string; value: string }) { return <View style={styles.movementDetail}><Text style={styles.movementLabel}>{label}</Text><Text style={styles.movementValue}>{value}</Text></View>; }
const styles = StyleSheet.create({
  content: { alignSelf: 'center', maxWidth: 1272, padding: 16, width: '100%' }, compactContent: { padding: 12 }, formsRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 }, formsColumn: { flexDirection: 'column' }, formCard: { flex: 1, minWidth: 0, padding: 16 }, stackedFormCard: { alignSelf: 'stretch', flexBasis: 'auto', flexGrow: 0, flexShrink: 0 }, cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginBottom: 16 }, cardHeaderText: { flex: 1, minWidth: 0 }, eyebrow: { color: '#3566A8', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 }, title: { color: '#12355B', fontSize: 22, fontWeight: '700', lineHeight: 27 }, cardDescription: { color: '#536B83', fontSize: 13, lineHeight: 19, marginTop: 5 }, statusPill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }, entryPill: { backgroundColor: '#E1F4F3' }, exitPill: { backgroundColor: '#FCE7E2' }, statusPillText: { color: '#087A73', fontSize: 12, fontWeight: '700' }, exitPillText: { color: '#A53427' }, notice: { backgroundColor: '#F6FAFF', borderColor: '#D5E4F3', borderLeftColor: '#3566A8', borderLeftWidth: 3, borderRadius: 7, marginBottom: 14, paddingHorizontal: 10, paddingVertical: 9 }, noticeText: { color: '#536B83', fontSize: 12, lineHeight: 17 }, formSection: { gap: 12 }, exitFormSection: { alignSelf: 'stretch', flexGrow: 0, justifyContent: 'flex-start' }, stockField: { flexGrow: 0 }, fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, fieldsColumn: { flexDirection: 'column' }, halfField: { flexBasis: 180, flexGrow: 1 }, fullField: { flexBasis: 'auto', width: '100%' }, cardFooter: { alignItems: 'center', borderTopColor: '#D5E4F3', borderTopWidth: 1, flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginTop: 18, paddingTop: 14 }, footerHint: { color: '#536B83', flex: 1, fontSize: 12, lineHeight: 17 }, buttonRow: { alignSelf: 'flex-start' }, movementsCard: { marginTop: 14, padding: 16 }, movementsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }, movementsTitle: { color: '#12355B', fontSize: 20, fontWeight: '700', lineHeight: 24 }, countPill: { backgroundColor: '#EAF4FF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }, countPillText: { color: '#087A73', fontSize: 12, fontWeight: '700' }, table: { borderColor: '#D5E4F3', borderWidth: 1, overflow: 'hidden' }, tableScrollContent: { minWidth: '100%' }, tableContent: { minWidth: 860 }, row: { flexDirection: 'row', minHeight: 42 }, alternateRow: { backgroundColor: '#EEF5FC' }, tableHeader: { backgroundColor: '#1677D2', minHeight: 34 }, cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 0, paddingHorizontal: 9, paddingVertical: 10 }, headerCell: { color: '#FFFFFF', fontWeight: '700', paddingVertical: 9 }, movementList: { gap: 10 }, movementItem: { backgroundColor: '#F6FAFF', borderColor: '#D5E4F3', borderRadius: 10, borderWidth: 1, gap: 9, padding: 13 }, movementDetail: { borderBottomColor: '#D5E4F3', borderBottomWidth: 1, flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingBottom: 8 }, movementLabel: { color: '#12355B', flex: 1, fontSize: 12, fontWeight: '700' }, movementValue: { color: '#162B45', flex: 2, fontSize: 13, textAlign: 'right' },
});
