import { useCallback, useMemo, useState } from 'react';
import { Alert, PanResponder, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, FormField, PageCard, SelectField } from './ui';
import { biometrics } from '../src/security/biometrics';

export type Delivery = {
  id: number;
  worker: string;
  role: string;
  epi: string;
  quantity: string;
  date: string;
  nextExchange: string;
  reason: string;
  confirmation: string;
  signature: Signature;
};

export type Point = { x: number; y: number };
export type Signature = Point[][];

const workers = ['gustavo — Programador'];
const epis = ['Capacete — CA 10 — estoque 99'];
const reasons = ['Entrega inicial', 'Troca por prazo', 'Substituição por avaria', 'Reposição por perda'];
const headers = ['Trabalhador', 'Função', 'EPI', 'Qtd.', 'Data', 'Próxima troca', 'Motivo', 'Confirmação'];

const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(date);
const parseDate = (value: string) => {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
};

function SignaturePad({ value, onChange }: { value: Signature; onChange: (signature: Signature) => void }) {
  const startStroke = useCallback((point: Point) => {
    onChange([...value, [point]]);
  }, [onChange, value]);

  const addPoint = useCallback((point: Point) => {
    const currentStroke = value[value.length - 1];
    if (!currentStroke) return;

    const lastPoint = currentStroke[currentStroke.length - 1];
    if (Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 1.5) return;
    onChange([...value.slice(0, -1), [...currentStroke, point]]);
  }, [onChange, value]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (event) => startStroke({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }),
    onPanResponderMove: (event) => addPoint({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }),
    onPanResponderTerminationRequest: () => false,
  }), [addPoint, startStroke]);

  const hasSignature = value.some((stroke) => stroke.length > 1);
  return <View
    accessible
    accessibilityLabel="Área para assinatura do trabalhador"
    accessibilityHint="Desenhe a assinatura com o dedo, caneta ou mouse"
    style={styles.signatureArea}
    {...responder.panHandlers}
  >
    {value.flatMap((stroke, strokeIndex) => stroke.slice(1).map((point, pointIndex) => {
      const previous = stroke[pointIndex];
      const width = Math.hypot(point.x - previous.x, point.y - previous.y);
      const angle = Math.atan2(point.y - previous.y, point.x - previous.x) * (180 / Math.PI);
      return <View key={`${strokeIndex}-${pointIndex}`} style={[styles.signatureStroke, {
        left: (previous.x + point.x) / 2 - width / 2,
        top: (previous.y + point.y) / 2 - 1.25,
        width,
        transform: [{ rotate: `${angle}deg` }],
      }]} />;
    }))}
    {!hasSignature && <Text style={styles.signatureHint}>Assine aqui com o dedo, caneta ou mouse</Text>}
  </View>;
}

export function DeliveryScreen({ deliveries, onRegisterDelivery }: { deliveries: Delivery[]; onRegisterDelivery: (delivery: Delivery) => void }) {
  const today = useMemo(() => formatDate(new Date()), []);
  const [worker, setWorker] = useState(workers[0]);
  const [epi, setEpi] = useState(epis[0]);
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(today);
  const [reason, setReason] = useState(reasons[0]);
  const [signature, setSignature] = useState<Signature>([]);
  const signed = signature.some((stroke) => stroke.length > 1);

  const nextExchange = useMemo(() => {
    const parsed = parseDate(date);
    if (Number.isNaN(parsed.getTime())) return 'Data inválida';
    parsed.setDate(parsed.getDate() + 10);
    return formatDate(parsed);
  }, [date]);


  const registerDelivery = async () => {
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }
    if (!signed) {
      Alert.alert('Assinatura necessária', 'Registre a assinatura digital do trabalhador antes de confirmar a entrega.');
      return;
    }
    const biometricResult = await biometrics.authenticateDocumentSignature();
    if (!biometricResult.success) {
      Alert.alert('Assinatura não confirmada', biometricResult.message);
      return;
    }
    const [workerName, role] = worker.split(' — ');
    onRegisterDelivery({
      id: Date.now(), worker: workerName, role, epi: epi.split(' — ')[0], quantity, date, nextExchange, reason, confirmation: 'Assinatura digital e biométrica', signature,
    });
    setQuantity('1');
    setReason(reasons[0]);
    setSignature([]);
    Alert.alert('Entrega confirmada', 'O estoque foi baixado e a entrega foi registrada.');
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      <Text style={styles.title}>Registro de entrega</Text>
      <View style={styles.formRow}>
        <SelectField label="Trabalhador" value={worker} options={workers} onValueChange={setWorker} containerStyle={styles.workerField} />
        <SelectField label="EPI" value={epi} options={epis} onValueChange={setEpi} containerStyle={styles.epiField} />
      </View>
      <Text style={styles.recommendation}>Função: Programador   EPIs recomendados: Capacete</Text>

      <View style={styles.formRow}>
        <FormField label="Quantidade" value={quantity} onChangeText={setQuantity} keyboardType="numeric" containerStyle={styles.quantityField} />
        <FormField label="Data" value={date} onChangeText={setDate} placeholder="dd/mm/aaaa" containerStyle={styles.dateField} />
        <View style={[styles.readonlyField, styles.exchangeField]}><Text style={styles.label}>Próxima troca automática</Text><View style={styles.readonlyInput}><Text style={styles.readonlyText}>{nextExchange}</Text></View></View>
      </View>
      <Text style={styles.help}>Troca definida a cada 10 dia(s). Próxima troca calculada automaticamente.</Text>
      <SelectField label="Motivo padronizado" value={reason} options={reasons} onValueChange={setReason} />

      <View style={styles.signaturePanel}>
        <Text style={styles.signatureTitle}>Assinatura digital do trabalhador</Text>
        <SignaturePad value={signature} onChange={setSignature} />
        <View style={[styles.statusPill, signed && styles.signedPill]}><Text style={[styles.statusText, signed && styles.signedStatusText]}>{signed ? 'Assinatura registrada' : 'Assinatura pendente'}</Text></View>
        <View style={styles.clearButton}><AppButton title="Limpar assinatura" variant="secondary" onPress={() => setSignature([])} /></View>
      </View>

      <Text style={styles.biometricHelp}>A confirmação da entrega solicita a biometria do dispositivo.</Text>
      <View style={styles.confirmButton}><AppButton title="Confirmar entrega e assinar com biometria" onPress={() => void registerDelivery()} /></View>
      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{headers.map((header) => <Text key={header} style={[styles.cell, styles.headerCell]}>{header}</Text>)}</View>
        {deliveries.map((delivery, index) => <View key={delivery.id} style={[styles.row, index % 2 === 1 && styles.alternateRow]}>
          {[delivery.worker, delivery.role, delivery.epi, delivery.quantity, delivery.date, delivery.nextExchange, delivery.reason, delivery.confirmation].map((value, cellIndex) => <Text key={`${delivery.id}-${cellIndex}`} style={[styles.cell, cellIndex === 6 && styles.reasonCell]}>{value}</Text>)}
        </View>)}
      </View></ScrollView></View>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', padding: 12, width: '100%' },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 18 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  workerField: { flexBasis: 360 }, epiField: { flexBasis: 360 },
  recommendation: { color: '#536B83', fontSize: 12, marginTop: 3, marginBottom: 13 },
  quantityField: { flexBasis: 180 }, dateField: { flexBasis: 180 },
  readonlyField: { flexBasis: 260, flexGrow: 1, flexShrink: 1, gap: 7, minWidth: 0 }, exchangeField: {},
  label: { color: '#12355B', fontSize: 14, fontWeight: '700' },
  readonlyInput: { backgroundColor: '#F3F8FD', borderColor: '#AABFD4', borderRadius: 7, borderWidth: 1, height: 43, justifyContent: 'center', paddingHorizontal: 12 },
  readonlyText: { color: '#536B83', fontSize: 16 }, help: { color: '#536B83', fontSize: 12, marginTop: 5, marginBottom: 14 },
  signaturePanel: { borderColor: '#D5E4F3', borderRadius: 9, borderWidth: 1, marginTop: 12, padding: 11 },
  signatureTitle: { color: '#12355B', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  signatureArea: { alignItems: 'center', backgroundColor: '#F8FBFF', borderColor: '#1677D2', borderRadius: 7, borderStyle: 'dashed', borderWidth: 2, height: 145, justifyContent: 'center', marginHorizontal: 1, overflow: 'hidden', position: 'relative' },
  signatureHint: { color: '#7489A0', fontSize: 13, pointerEvents: 'none' }, signatureStroke: { backgroundColor: '#12355B', borderRadius: 2, height: 2.5, pointerEvents: 'none', position: 'absolute' },
  statusPill: { alignSelf: 'flex-start', backgroundColor: '#FFF0C3', borderRadius: 14, marginTop: 9, paddingHorizontal: 10, paddingVertical: 5 },
  signedPill: { backgroundColor: '#D6F3F0' }, statusText: { color: '#805A00', fontSize: 12, fontWeight: '700' }, signedStatusText: { color: '#1677D2' },
  clearButton: { alignSelf: 'flex-start', marginTop: 12 }, confirmButton: { alignSelf: 'flex-start', marginTop: 14 },
  biometricHelp: { color: '#536B83', fontSize: 12, marginTop: 13 },
  table: { borderColor: '#D5E4F3', borderWidth: 1, marginTop: 14, width: '100%' }, tableScroll: { flexGrow: 1, minWidth: '100%' }, tableContent: { minWidth: 1022, width: '100%' }, row: { flexDirection: 'row', minHeight: 35, width: '100%' }, alternateRow: { backgroundColor: '#EEF5FC' }, tableHeader: { backgroundColor: '#1677D2' },
  cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 122, paddingHorizontal: 9, paddingTop: 9 },
  reasonCell: { minWidth: 168 }, headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 9 },
});
