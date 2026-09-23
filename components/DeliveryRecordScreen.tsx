import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { type Delivery, type Signature } from './DeliveryScreen';
import { AppButton, PageCard, SelectField } from './ui';

const workers = [
  { option: 'gustavo — 1010', name: 'gustavo', registration: '1010', role: 'Programador', department: 'tecnologia' },
  { option: 'marina — 1011', name: 'marina', registration: '1011', role: 'Técnica de segurança', department: 'segurança' },
];

const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(date);

const responsibilityTerm = 'Declaro que recebi gratuitamente da Destilaria Vale do Paracatu Agroenergia LTDA. o(s) Equipamento(s) de Proteção Individual - EPIs relacionado(s) abaixo (e ao verso) e o respectivo treinamento para o seu uso, conforme estabelecido pelo Artigo 166 da Consolidação das Leis do Trabalho combinado com o item 6.3, alínea "a", e o subitem 6.6.1, alínea "d", da Norma Regulamentadora - NR6, do Ministério do Trabalho e Emprego, com a redação dada pela Portaria/MTE Nº 25, de 15 de outubro de 2001. Comprometo-me a usá-los apenas para a finalidade a que se destinam, responsabilizo-me por sua guarda e conservação, estando obrigado a comunicar ao empregador qualquer alteração que os tornem impróprios para o uso, nos termos do subitem 6.7.1 da referida NR6. Em caso de extravio, perda, uso inadequado, inutilização antes do término do prazo previsto para a sua duração, fica acordado que será lícito o desconto correspondente em meu salário, conforme o Artigo 462, Parágrafo 1º, da CLT. Estou ciente de que a recusa injustificada ao uso obrigatório desses EPIs, para a minha proteção em relação aos riscos presentes no meu ambiente de trabalho, se constituirá ato faltoso da minha parte, dando ensejo à demissão por justa causa (Artigo 482, alínea "h", da CLT). Em caso de desligamento dessa empresa, devolverei a ela todos os EPIs que estiverem sob minha responsabilidade.';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

function signatureSvg(signature: Signature) {
  if (!signature.some((stroke) => stroke.length > 1)) return '';
  const paths = signature.map((stroke) => {
    if (stroke.length < 2) return '';
    return `<polyline points="${stroke.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')}" />`;
  }).join('');
  return `<svg viewBox="0 0 400 145" preserveAspectRatio="xMidYMid meet" aria-label="Assinatura do empregado">${paths}</svg>`;
}

function buildRecordHtml(worker: typeof workers[number], date: string, deliveries: Delivery[]) {
  const field = (label: string, value: string) => `<div class="field"><strong>${label}:</strong> ${escapeHtml(value)}</div>`;
  const deliveryRows = deliveries.length === 0
    ? '<tr><td colspan="7">Nenhuma entrega registrada para este trabalhador.</td></tr>'
    : deliveries.map((delivery) => `<tr><td>${escapeHtml(delivery.epi)}</td><td>${escapeHtml(delivery.quantity)}</td><td>10</td><td>${escapeHtml(delivery.date)}</td><td class="signature-drawing">${signatureSvg(delivery.signature)}</td><td>${escapeHtml(delivery.nextExchange)}</td><td></td></tr>`).join('');

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; }
        body { color: #02060c; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; margin: 0; }
        .document { border: 1px solid #1f2823; }
        .header { display: flex; min-height: 70px; }
        .mark { align-items: center; border-right: 1px solid #1f2823; display: flex; font-size: 19pt; font-weight: 700; justify-content: center; width: 82px; }
        .heading { align-items: center; display: flex; flex: 1; font-size: 11pt; font-weight: 700; justify-content: center; padding: 10px 18px; text-align: center; }
        .details { border-top: 1px solid #1f2823; display: grid; grid-template-columns: 2fr 1.1fr 1.7fr 1.25fr; }
        .field { border-bottom: 1px solid #1f2823; border-right: 1px solid #1f2823; min-height: 28px; padding: 7px 8px; }
        .field:last-child { border-right: 0; }
        .term { border-bottom: 1px solid #1f2823; padding: 10px; text-align: justify; }
        .term h2 { color: #12355B; font-size: 11pt; margin: 0 0 9px; text-align: center; }
        .term p { line-height: 1.4; margin: 0; }
        .signature { border-bottom: 1px solid #1f2823; display: flex; flex-wrap: wrap; gap: 24px; min-height: 39px; padding: 10px; }
        table { border-collapse: collapse; table-layout: fixed; width: 100%; }
        th, td { border-right: 1px solid #1f2823; padding: 7px 4px; text-align: center; vertical-align: middle; }
        th:last-child, td:last-child { border-right: 0; }
        th { border-bottom: 1px solid #1f2823; font-size: 8pt; }
        td { height: 36px; }
        .epi { width: 13%; } .quantity { width: 9%; } .ca { width: 7%; } .delivery { width: 15%; } .employee-signature { width: 23%; } .exchange { width: 18%; } .return { width: 15%; }
        .signature-drawing svg { display: block; height: 32px; margin: auto; max-width: 100%; width: 100%; } .signature-drawing polyline { fill: none; stroke: #12355B; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3; }
      </style>
    </head>
    <body>
      <main class="document">
        <section class="header"><div class="mark">EPI</div><div class="heading">FICHA DE CONTROLE DE DISTRIBUIÇÃO DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL - EPI</div></section>
        <section class="details">${field('Nome', worker.name)}${field('Matrícula', worker.registration)}${field('Função', worker.role)}${field('Setor', worker.department)}</section>
        <section class="term"><h2>TERMO DE RESPONSABILIDADE</h2><p>${responsibilityTerm}</p></section>
        <section class="signature"><span><strong>Data:</strong> ${escapeHtml(date)}</span><span><strong>Assinatura do empregado:</strong> _______________________________</span></section>
        <table><thead><tr><th class="epi">EPI</th><th class="quantity">QUANT.</th><th class="ca">C.A</th><th class="delivery">DATA ENTREGA</th><th class="employee-signature">ASSINATURA</th><th class="exchange">PRÓXIMA TROCA</th><th class="return">DEVOLUÇÃO</th></tr></thead><tbody>${deliveryRows}</tbody></table>
      </main>
    </body>
  </html>`;
}

export function DeliveryRecordScreen({ deliveries }: { deliveries: Delivery[] }) {
  const [workerIndex, setWorkerIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const worker = workers[workerIndex];
  const date = useMemo(() => formatDate(lastUpdated), [lastUpdated]);
  const workerDeliveries = useMemo(() => deliveries.filter((delivery) => delivery.worker === worker.name), [deliveries, worker.name]);

  const refreshRecord = () => {
    setLastUpdated(new Date());
    Alert.alert('Ficha atualizada', 'Os dados mais recentes de entregas foram carregados.');
  };

  const generatePdf = async () => {
    const html = buildRecordHtml(worker, date, workerDeliveries);

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        Alert.alert('Não foi possível abrir a impressão', 'Permita pop-ups neste navegador e tente novamente.');
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const options: Print.FilePrintOptions = Platform.OS === 'ios'
        ? { html, width: 595, height: 842, margins: { top: 0, right: 0, bottom: 0, left: 0 } }
        : { html, width: 595, height: 842, textZoom: 100 };
      const { uri } = await Print.printToFileAsync(options);
      if (!uri) {
        throw new Error('O arquivo PDF não foi criado.');
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: 'Salvar ou compartilhar ficha de EPI', mimeType: 'application/pdf', UTI: '.pdf' });
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.warn('Falha ao criar a ficha em PDF:', error);
      try {
        await Print.printAsync({ html });
      } catch (printError) {
        console.warn('Falha ao abrir a impressão da ficha:', printError);
        Alert.alert('Não foi possível abrir a ficha', 'Tente novamente em alguns instantes.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard style={styles.card}>
      <Text style={styles.title}>Ficha de Controle de Distribuição de EPI</Text>
      <SelectField label="Trabalhador" value={worker.option} options={workers.map((item) => item.option)} onValueChange={(option) => setWorkerIndex(workers.findIndex((item) => item.option === option))} containerStyle={styles.workerSelector} />

      <View style={styles.document}>
        <View style={styles.documentHeader}>
          <View style={styles.epiMark}><Text style={styles.epiMarkText}>EPI</Text></View>
          <View style={styles.documentHeading}><Text style={styles.documentHeadingText}>FICHA DE CONTROLE DE DISTRIBUIÇÃO DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL - EPI</Text></View>
        </View>

        <View style={styles.identificationRow}>
          <InfoCell label="Nome" value={worker.name} style={styles.nameCell} />
          <InfoCell label="Matrícula" value={worker.registration} style={styles.registrationCell} />
          <InfoCell label="Função" value={worker.role} style={styles.roleCell} />
          <InfoCell label="Setor" value={worker.department} style={styles.departmentCell} />
        </View>

        <View style={styles.statement}>
          <Text style={styles.statementTitle}>TERMO DE RESPONSABILIDADE</Text>
          <Text style={styles.statementText}>{responsibilityTerm}</Text>
        </View>

        <View style={styles.signatureDate}><Text style={styles.dateText}><Text style={styles.bold}>Data:</Text> {date}</Text><Text style={styles.signatureDateText}><Text style={styles.bold}>Assinatura do empregado:</Text> <Text style={styles.signatureLine}>_______________________________</Text></Text></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableCell value="EPI" style={styles.epiColumn} header />
            <TableCell value="QUANT." style={styles.quantityColumn} header />
            <TableCell value="C.A" style={styles.caColumn} header />
            <TableCell value="DATA ENTREGA" style={styles.deliveryDateColumn} header />
            <TableCell value="ASSINATURA" style={styles.tableSignatureColumn} header />
            <TableCell value="PRÓXIMA TROCA" style={styles.exchangeColumn} header />
            <TableCell value="DEVOLUÇÃO" style={styles.returnColumn} header last />
          </View>
          {workerDeliveries.length === 0 ? <View style={styles.emptyRow}><Text style={styles.emptyRowText}>Nenhuma entrega registrada para este trabalhador.</Text></View> : workerDeliveries.map((delivery) => <View key={delivery.id} style={styles.tableRow}>
            <TableCell value={delivery.epi} style={styles.epiColumn} />
            <TableCell value={delivery.quantity} style={styles.quantityColumn} />
            <TableCell value="10" style={styles.caColumn} />
            <TableCell value={delivery.date} style={styles.deliveryDateColumn} />
            <TableCell value="" style={styles.tableSignatureColumn} signatureData={delivery.signature} />
            <TableCell value={delivery.nextExchange} style={styles.exchangeColumn} />
            <TableCell value="" style={styles.returnColumn} last />
          </View>)}
        </View>
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <AppButton title="Atualizar ficha" onPress={refreshRecord} />
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: isGeneratingPdf }} disabled={isGeneratingPdf} onPress={generatePdf} style={[styles.printButton, isGeneratingPdf && styles.printButtonDisabled]}><Text style={styles.printButtonText}>{isGeneratingPdf ? 'Gerando PDF...' : 'Gerar PDF / imprimir'}</Text></Pressable>
      </View>
    </PageCard>
  </ScrollView>;
}

function InfoCell({ label, value, style }: { label: string; value: string; style: object }) {
  return <View style={[styles.infoCell, style]}><Text style={styles.infoText}><Text style={styles.bold}>{label}:</Text> {value}</Text></View>;
}

function SignaturePreview({ signature }: { signature: Signature }) {
  const points = signature.flat();
  if (points.length < 2) return <Text style={styles.tableText}>—</Text>;
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const scale = Math.min(112 / Math.max(maxX - minX, 1), 25 / Math.max(maxY - minY, 1));
  const offsetX = (120 - (maxX - minX) * scale) / 2;
  const offsetY = (31 - (maxY - minY) * scale) / 2;

  return <View style={styles.signaturePreview}>{signature.flatMap((stroke, strokeIndex) => stroke.slice(1).map((point, pointIndex) => {
    const previous = stroke[pointIndex];
    const left = (previous.x - minX) * scale + offsetX;
    const top = (previous.y - minY) * scale + offsetY;
    const width = Math.hypot(point.x - previous.x, point.y - previous.y) * scale;
    const angle = Math.atan2(point.y - previous.y, point.x - previous.x) * (180 / Math.PI);
    return <View key={`${strokeIndex}-${pointIndex}`} style={[styles.signatureStroke, { left, top: top - 1, width, transform: [{ rotate: `${angle}deg` }] }]} />;
  }))}</View>;
}

function TableCell({ value, style, header = false, last = false, signatureData }: { value: string; style: object; header?: boolean; last?: boolean; signatureData?: Signature }) {
  const content: ReactNode = signatureData ? <SignaturePreview signature={signatureData} /> : <Text style={[styles.tableText, header && styles.tableHeaderText]}>{value}</Text>;
  return <View style={[styles.tableCell, style, !last && styles.cellBorder]}>{content}</View>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', padding: 12, width: '100%' },
  card: { gap: 12, padding: 16 },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700' },
  workerSelector: { flexBasis: 'auto', flexGrow: 0 },
  document: { borderColor: '#1F2823', borderWidth: 1, marginTop: 1, overflow: 'hidden' },
  documentHeader: { flexDirection: 'row', minHeight: 70 },
  epiMark: { alignItems: 'center', borderRightColor: '#1F2823', borderRightWidth: 1, justifyContent: 'center', width: 84 },
  epiMarkText: { color: '#0B1825', fontSize: 20, fontWeight: '700' },
  documentHeading: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 14 },
  documentHeadingText: { color: '#050B14', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  identificationRow: { flexDirection: 'row', flexWrap: 'wrap', borderTopColor: '#1F2823', borderTopWidth: 1 },
  infoCell: { borderBottomColor: '#1F2823', borderRightColor: '#1F2823', borderRightWidth: 1, borderBottomWidth: 1, minHeight: 27, justifyContent: 'center', paddingHorizontal: 8 },
  infoText: { color: '#02060C', fontSize: 12 }, bold: { fontWeight: '700' },
  nameCell: { flexBasis: 260, flexGrow: 1.35 }, registrationCell: { flexBasis: 155, flexGrow: .7 }, roleCell: { flexBasis: 230, flexGrow: 1 }, departmentCell: { borderRightWidth: 0, flexBasis: 190, flexGrow: .85 },
  statement: { borderBottomColor: '#1F2823', borderBottomWidth: 1, paddingHorizontal: 9, paddingVertical: 10 },
  statementTitle: { color: '#12355B', fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  statementText: { color: '#02060C', fontSize: 12, lineHeight: 15, textAlign: 'justify' },
  signatureDate: { alignItems: 'flex-start', borderBottomColor: '#1F2823', borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, minHeight: 35, paddingHorizontal: 9, paddingVertical: 8 },
  dateText: { color: '#02060C', fontSize: 12 }, signatureDateText: { color: '#02060C', fontSize: 12 }, signatureLine: { fontSize: 13, letterSpacing: -1 },
  tableScroll: { flexGrow: 1, minWidth: '100%' }, table: { minWidth: 730, width: '100%' }, tableRow: { flexDirection: 'row', minHeight: 34, width: '100%' }, tableHeader: { minHeight: 28 }, emptyRow: { alignItems: 'center', justifyContent: 'center', minHeight: 42, width: '100%' }, emptyRowText: { color: '#536B83', fontSize: 11 },
  tableCell: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, cellBorder: { borderRightColor: '#1F2823', borderRightWidth: 1 }, tableText: { color: '#02060C', fontSize: 10, textAlign: 'center' }, tableHeaderText: { fontSize: 10, fontWeight: '700' },
  epiColumn: { flex: 1.05 }, quantityColumn: { flex: .95 }, caColumn: { flex: .65 }, deliveryDateColumn: { flex: 1.7 }, tableSignatureColumn: { flex: 2.4 }, exchangeColumn: { flex: 1.8 }, returnColumn: { flex: 1.45 },
  signaturePreview: { height: 31, overflow: 'hidden', position: 'relative', width: 120 }, signatureStroke: { backgroundColor: '#12355B', borderRadius: 2, height: 2, position: 'absolute' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  printButton: { alignItems: 'center', backgroundColor: '#1677FF', borderRadius: 7, justifyContent: 'center', minHeight: 42, paddingHorizontal: 15 }, printButtonDisabled: { opacity: .65 }, printButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
