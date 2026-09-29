import { endpoints } from '../src/api/endpoints';
import { jsonRequest, type Job, type Worker as ApiWorker } from '../src/api/resources';
import { useRemoteList } from '../src/hooks/useRemoteList';
import { isValidCpf } from '../src/validation/cpf';
import { useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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


const tableHeaders = ['Nome', 'CPF', 'Matrícula', 'Função', 'Setor', 'EPIs recomendados', 'Ação'];

export function WorkerScreen() {
  const scroll = useRef<ScrollView>(null);
  const mutationPending = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const remote = useRemoteList<ApiWorker>(endpoints.workers);
  const jobs = useRemoteList<Job>(endpoints.functions);
  const jobOptions = ['Selecione', ...new Set(jobs.items.map(item => item.nome))];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const workers: Worker[] = remote.items.map(w => ({ id: w.id, name: w.nome, cpf: w.cpf, registration: w.matricula, job: w.funcao, sector: w.setor, epis: w.epis_recomendados ?? [] }));
  const removeWorker = async () => {
    if (busy || mutationPending.current || !deleteTarget) return;
    mutationPending.current = true;
    setBusy(true); setError('');
    try {
      await jsonRequest(endpoints.worker(deleteTarget.id), 'DELETE');
      if (editingId === deleteTarget.id) clearForm();
      await remote.refresh();
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao excluir.'); }
    finally {
      setDeleteTarget(null); mutationPending.current = false; setBusy(false);
      scroll.current?.scrollTo({ y: 0, animated: true });
    }
  };
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [registration, setRegistration] = useState('');
  const [job, setJob] = useState(jobOptions[0]);
  const [sector, setSector] = useState('');
  const [selectedEpis, setSelectedEpis] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const functionEpis = jobs.items.find(item => item.nome === job)?.epis ?? [];
  const recommendedEpis = [...new Set([...functionEpis.map(item => item.equipamento), ...selectedEpis])];

  const clearForm = () => {
    setName('');
    setCpf('');
    setCpfError('');
    setRegistration('');
    setJob('Selecione');
    setSector('');
    setSelectedEpis([]);
    setEditingId(null);
  };

  const toggleEpi = (epi: string) => setSelectedEpis((current) => current.includes(epi) ? current.filter((item) => item !== epi) : [...current, epi]);

  const saveWorker = async () => {
    if (busy) return;
    if (!isValidCpf(cpf)) {
      setCpfError('CPF inválido. Informe um CPF válido com 11 dígitos.');
      return;
    }
    setCpfError('');
    if (!name.trim() || !cpf.trim() || !registration.trim() || !sector.trim() || job === 'Selecione') {
      Alert.alert('Preencha os dados', 'Informe nome, CPF, matrícula, função e setor antes de cadastrar.');
      return;
    }
    setBusy(true); setError('');
    try {
      await jsonRequest(editingId === null ? endpoints.workers : endpoints.worker(editingId), editingId === null ? 'POST' : 'PATCH', { nome: name.trim(), cpf: cpf.trim(), matricula: registration.trim(), funcao: job, setor: sector.trim(), epis_recomendados: selectedEpis });
      clearForm(); await remote.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar.'); }
    finally { setBusy(false); }
  };

  const editWorker = (worker: Worker) => {
    setName(worker.name);
    setCpf(worker.cpf);
    setCpfError('');
    setRegistration(worker.registration);
    setJob(worker.job);
    setSector(worker.sector);
    setSelectedEpis(worker.epis);
    setEditingId(worker.id);
  };

  return <ScrollView ref={scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      {!!(error || remote.error) && <Text accessibilityRole="alert">{error || remote.error}</Text>}
      {remote.loading && <Text>Carregando trabalhadores...</Text>}
      <Text style={styles.title}>Cadastro de trabalhador</Text>
      <View style={styles.formGrid}>
        <FormField label="Nome completo" placeholder="Nome do trabalhador" value={name} onChangeText={setName} containerStyle={styles.nameField} />
        <View style={styles.cpfField}>
          <FormField label="CPF" placeholder="000.000.000-00" value={cpf} onChangeText={(value) => { setCpf(value); setCpfError(''); }} keyboardType="numeric" />
          {!!cpfError && <Text accessibilityRole="alert" style={styles.fieldError}>{cpfError}</Text>}
        </View>
        <FormField label="Matrícula" placeholder="Matrícula" value={registration} onChangeText={setRegistration} containerStyle={styles.registrationField} />
        <View style={styles.jobField}>
          <SelectField label="Função" value={job} options={jobOptions} onValueChange={setJob} onOpen={() => { if (!jobs.loading) void jobs.refresh(); }} />
          {jobs.loading && <Text style={styles.help}>Carregando funções...</Text>}
          {!!jobs.error && <Text accessibilityRole="alert">Não foi possível carregar as funções: {jobs.error}</Text>}
          {!jobs.loading && !jobs.error && jobs.items.length === 0 && <Text style={styles.help}>Nenhuma função cadastrada. Cadastre uma em “Funções e periodicidades”.</Text>}
        </View>
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
        <Text style={styles.help}>{job === 'Selecione' ? 'Selecione uma função para ver os EPIs recomendados.' : functionEpis.length === 0 ? 'A função selecionada não possui periodicidades cadastradas.' : functionEpis.map(epi => `${epi.equipamento}: ${epi.periodicidade === 'dias' ? `${epi.quantidade_dias} dia(s)` : 'sem prazo'}`).join(' • ')}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title={editingId === null ? 'Cadastrar trabalhador' : 'Salvar alterações'} onPress={saveWorker} disabled={busy} />
        {editingId !== null && <AppButton title="Cancelar edição" variant="secondary" onPress={clearForm} />}
      </View>

      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{tableHeaders.map((header) => <Text key={header} style={[styles.cell, styles.headerCell, header === 'EPIs recomendados' && styles.epiColumn]}>{header}</Text>)}</View>
        {workers.map((worker) => <View key={worker.id} style={styles.row}>
          {[worker.name, worker.cpf, worker.registration, worker.job, worker.sector, worker.epis.join(', ') || '-'].map((value, index) => <Text key={`${worker.id}-${index}`} style={[styles.cell, index === 5 && styles.epiColumn]}>{value}</Text>)}
          <View style={styles.actionCell}><AppButton title="Editar" disabled={busy} onPress={() => editWorker(worker)} /><AppButton title="Excluir" variant="danger" disabled={busy} onPress={() => setDeleteTarget(worker)} /></View>
        </View>)}
      </View></ScrollView></View>
      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => { if (!busy) setDeleteTarget(null); }}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.confirmation}>
            <Text style={styles.modalTitle}>Excluir trabalhador?</Text>
            <Text style={styles.modalDescription}>Deseja excluir {deleteTarget?.name}? Esta ação não pode ser desfeita.</Text>
            <View style={styles.modalActions}>
              <AppButton title="Cancelar" variant="secondary" disabled={busy} onPress={() => setDeleteTarget(null)} />
              <AppButton title={busy ? 'Excluindo...' : 'Confirmar exclusão'} variant="danger" disabled={busy} onPress={() => void removeWorker()} />
            </View>
          </View>
        </View>
      </Modal>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmation: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 },
  modalTitle: { color: '#12355B', fontSize: 24, fontWeight: '700' },
  modalDescription: { color: '#536B83', fontSize: 14, lineHeight: 21, marginBottom: 20, marginTop: 6 },
  modalActions: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
  content: { alignSelf: 'center', padding: 16, width: '100%' },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  nameField: { flexBasis: 450 },
  cpfField: { flexBasis: 360, flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 7 },
  fieldError: { color: '#C64032', fontSize: 13 },
  registrationField: { flexBasis: 250 },
  jobField: { flexBasis: 250, flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 7 },
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
