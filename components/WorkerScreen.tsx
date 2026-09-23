import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, FormField, PageCard, SelectField } from './ui';

type Worker = {
  id: number;
  name: string;
  cpf: string;
  registration: string;
  job: string;
  sector: string;
  epis: string[];
};

const jobOptions = ['Selecione', 'Programador'];
const recommendedEpis = ['Capacete'];
const tableHeaders = ['Nome', 'CPF', 'Matrícula', 'Função', 'Setor', 'EPIs recomendados', 'Ação'];

export function WorkerScreen() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [registration, setRegistration] = useState('');
  const [job, setJob] = useState(jobOptions[0]);
  const [sector, setSector] = useState('');
  const [selectedEpis, setSelectedEpis] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([
    { id: 1, name: 'gustavo', cpf: '020.138.856-10', registration: '1010', job: 'Programador', sector: 'tecnologia', epis: ['Capacete'] },
  ]);

  const clearForm = () => {
    setName('');
    setCpf('');
    setRegistration('');
    setJob('Selecione');
    setSector('');
    setSelectedEpis([]);
    setEditingId(null);
  };

  const toggleEpi = (epi: string) => setSelectedEpis((current) => current.includes(epi) ? current.filter((item) => item !== epi) : [...current, epi]);

  const saveWorker = () => {
    if (!name.trim() || !cpf.trim() || !registration.trim() || !sector.trim() || job === 'Selecione') {
      Alert.alert('Preencha os dados', 'Informe nome, CPF, matrícula, função e setor antes de cadastrar.');
      return;
    }
    const entry: Worker = { id: editingId ?? Date.now(), name: name.trim(), cpf: cpf.trim(), registration: registration.trim(), job, sector: sector.trim(), epis: selectedEpis };
    setWorkers((current) => editingId === null ? [...current, entry] : current.map((worker) => worker.id === editingId ? entry : worker));
    clearForm();
  };

  const editWorker = (worker: Worker) => {
    setName(worker.name);
    setCpf(worker.cpf);
    setRegistration(worker.registration);
    setJob(worker.job);
    setSector(worker.sector);
    setSelectedEpis(worker.epis);
    setEditingId(worker.id);
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      <Text style={styles.title}>Cadastro de trabalhador</Text>
      <View style={styles.formGrid}>
        <FormField label="Nome completo" placeholder="Nome do trabalhador" value={name} onChangeText={setName} containerStyle={styles.nameField} />
        <FormField label="CPF" placeholder="000.000.000-00" value={cpf} onChangeText={setCpf} keyboardType="numeric" containerStyle={styles.cpfField} />
        <FormField label="Matrícula" placeholder="Matrícula" value={registration} onChangeText={setRegistration} containerStyle={styles.registrationField} />
        <SelectField label="Função" value={job} options={jobOptions} onValueChange={setJob} containerStyle={styles.jobField} />
        <FormField label="Setor" placeholder="Setor" value={sector} onChangeText={setSector} containerStyle={styles.sectorField} />
      </View>

      <View style={styles.recommendedSection}>
        <Text style={styles.label}>EPIs recomendados</Text>
        <View style={styles.epiList}>
          {recommendedEpis.map((epi) => {
            const selected = selectedEpis.includes(epi);
            return <Pressable key={epi} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleEpi(epi)} style={styles.epiOption}>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>{selected && <Text style={styles.checkboxTick}>✓</Text>}</View>
              <Text style={styles.epiText}>{epi}</Text>
            </Pressable>;
          })}
        </View>
        <Text style={styles.help}>A função selecionada não possui periodicidades cadastradas.</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title={editingId === null ? 'Cadastrar trabalhador' : 'Salvar alterações'} onPress={saveWorker} />
        {editingId !== null && <AppButton title="Cancelar edição" variant="secondary" onPress={clearForm} />}
      </View>

      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{tableHeaders.map((header) => <Text key={header} style={[styles.cell, styles.headerCell, header === 'EPIs recomendados' && styles.epiColumn]}>{header}</Text>)}</View>
        {workers.map((worker) => <View key={worker.id} style={styles.row}>
          {[worker.name, worker.cpf, worker.registration, worker.job, worker.sector, worker.epis.join(', ') || '-'].map((value, index) => <Text key={`${worker.id}-${index}`} style={[styles.cell, index === 5 && styles.epiColumn]}>{value}</Text>)}
          <View style={styles.actionCell}><AppButton title="Editar" onPress={() => editWorker(worker)} /><AppButton title="Excluir" variant="danger" onPress={() => setWorkers((current) => current.filter((item) => item.id !== worker.id))} /></View>
        </View>)}
      </View></ScrollView></View>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', padding: 16, width: '100%' },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  nameField: { flexBasis: 450 },
  cpfField: { flexBasis: 360 },
  registrationField: { flexBasis: 250 },
  jobField: { flexBasis: 250 },
  sectorField: { flexBasis: 250 },
  recommendedSection: { marginTop: 15 },
  label: { color: '#12355B', fontSize: 14, fontWeight: '700' },
  epiList: { marginTop: 7, maxWidth: 600 },
  epiOption: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D5E4F3', borderRadius: 7, borderWidth: 1, flexDirection: 'row', height: 42, paddingHorizontal: 11 },
  checkbox: { alignItems: 'center', borderColor: '#7489A0', borderRadius: 2, borderWidth: 1, height: 14, justifyContent: 'center', width: 14 },
  checkboxSelected: { backgroundColor: '#1677D2', borderColor: '#1677D2' },
  checkboxTick: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', lineHeight: 12 },
  epiText: { color: '#162B45', fontSize: 15, marginLeft: 10 },
  help: { color: '#536B83', fontSize: 12, lineHeight: 18, marginTop: 11 },
  actions: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 42 },
  table: { borderColor: '#D5E4F3', borderWidth: 1, marginTop: 14, width: '100%' },
  tableScroll: { flexGrow: 1, minWidth: '100%' },
  tableContent: { minWidth: 930, width: '100%' },
  row: { flexDirection: 'row', minHeight: 48, width: '100%' },
  tableHeader: { backgroundColor: '#1677D2', minHeight: 36 },
  cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 112, paddingHorizontal: 9, paddingTop: 13 },
  epiColumn: { minWidth: 200 },
  headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 10 },
  actionCell: { alignItems: 'center', borderRightColor: '#D5E4F3', borderRightWidth: 1, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minWidth: 170, paddingHorizontal: 8 },
});
