import { endpoints } from '../src/api/endpoints';
import { jsonRequest, type Epi, type Job } from '../src/api/resources';
import { useRemoteList } from '../src/hooks/useRemoteList';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, FormField, PageCard, SelectField } from './ui';

type Periodicity = 'Prazo em dias' | 'Outros (sem prazo)';
type FunctionEpi = { id: number; name: string; periodicity: Periodicity; days?: string };
type JobFunction = { id: number; name: string; description: string; epis: FunctionEpi[] };


const periodicityOptions: Periodicity[] = ['Prazo em dias', 'Outros (sem prazo)'];
const tableHeaders = ['Função', 'Descrição', 'EPIs e periodicidades', 'Ação'];

const formatPeriodicity = (epi: FunctionEpi) => epi.periodicity === 'Prazo em dias' ? `Troca a cada ${epi.days} dia(s)` : 'Outros (sem prazo)';

export function FunctionPeriodicityScreen() {
  const scroll = useRef<ScrollView>(null);
  const mutationPending = useRef(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobFunction | null>(null);
  const remote = useRemoteList<Job>(endpoints.functions);
  const [ca, setCa] = useState('');
  const [searchCa, setSearchCa] = useState('');
  const equipment = useRemoteList<Epi>(endpoints.searchEpis(searchCa), searchCa.length > 0);
  const epiOptions = ['Selecione', ...equipment.items.map(e => e.equipamento + ' · CA ' + e.nr_registro_ca + ' (#' + e.id + ')')];
  const functions: JobFunction[] = remote.items.map(j => ({ id: j.id, name: j.nome, description: j.descricao ?? '', epis: j.epis.map(e => ({ id: e.epi_id, name: e.equipamento, periodicity: e.periodicidade === 'dias' ? 'Prazo em dias' : 'Outros (sem prazo)', days: String(e.quantidade_dias ?? '') })) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEpi, setSelectedEpi] = useState(epiOptions[0]);
  const [periodicity, setPeriodicity] = useState<Periodicity>('Prazo em dias');
  const [days, setDays] = useState('');
  const [functionEpis, setFunctionEpis] = useState<FunctionEpi[]>([]);

  const clearForm = () => { setEditingId(null); setName(''); setDescription(''); setSelectedEpi('Selecione'); setPeriodicity('Prazo em dias'); setDays(''); setFunctionEpis([]); };

  const editFunction = (item: JobFunction) => {
    clearForm(); setError(''); setDeleteTarget(null);
    setEditingId(item.id); setName(item.name); setDescription(item.description);
    setFunctionEpis(item.epis.map(epi => ({ ...epi })));
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  const deleteFunction = async () => {
    if (busy || mutationPending.current || !deleteTarget) return;
    mutationPending.current = true;
    setBusy(true); setError('');
    try {
      await jsonRequest(endpoints.jobFunction(deleteTarget.id), 'DELETE');
      if (editingId === deleteTarget.id) clearForm();
      await remote.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao excluir função.'); }
    finally {
      setDeleteTarget(null); mutationPending.current = false; setBusy(false);
      scroll.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const getSelectedEpi = (): FunctionEpi | null => {
    if (selectedEpi === 'Selecione') { setError('Escolha o EPI que será associado à função.'); return null; }
    if (periodicity === 'Prazo em dias' && (!/^\d+$/.test(days) || Number(days) < 1)) { setError('Digite uma quantidade de dias maior que zero para este EPI.'); return null; }
    const equipmentItem = equipment.items[epiOptions.indexOf(selectedEpi) - 1];
    if (!equipmentItem) { setError('Atualize e selecione um EPI cadastrado.'); return null; }
    if (functionEpis.some((epi) => epi.id === equipmentItem.id)) { setError('Este EPI já está associado à função. Edite sua periodicidade na lista.'); return null; }
    return { id: equipmentItem.id, name: equipmentItem.equipamento, periodicity, days: periodicity === 'Prazo em dias' ? days.trim() : undefined };
  };

  const addEpi = () => {
    const epi = getSelectedEpi();
    if (!epi) return;
    setError('');
    setFunctionEpis((current) => [...current, epi]);
    setSelectedEpi('Selecione'); setPeriodicity('Prazo em dias'); setDays('');
  };

  const saveFunction = async () => {
    if (busy) return;
    if (!name.trim()) { setError('Digite o nome da função antes de cadastrar.'); return; }
    const pendingEpi = selectedEpi !== 'Selecione' ? getSelectedEpi() : null;
    if (selectedEpi !== 'Selecione' && !pendingEpi) return;
    const episToSave = pendingEpi ? [...functionEpis, pendingEpi] : functionEpis;
    if (episToSave.some(epi => epi.periodicity === 'Prazo em dias' && (!/^\d+$/.test(epi.days ?? '') || Number(epi.days) < 1))) { setError('Informe uma quantidade de dias maior que zero para cada EPI com prazo.'); return; }
    setBusy(true); setError('');
    try {
      await jsonRequest(editingId === null ? endpoints.functions : endpoints.jobFunction(editingId), editingId === null ? 'POST' : 'PATCH', { nome: name.trim(), descricao: description.trim(), epis: episToSave.map(e => ({ epi_id: e.id, periodicidade: e.periodicity === 'Prazo em dias' ? 'dias' : 'outros', quantidade_dias: e.periodicity === 'Prazo em dias' ? Number(e.days) : null })) });
      clearForm(); await remote.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar função.'); }
    finally { setBusy(false); }
  };


  return <ScrollView ref={scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      {!!(error || remote.error || equipment.error) && <Text accessibilityRole="alert">{error || remote.error || equipment.error}</Text>}
      {remote.loading && <Text>Carregando funções...</Text>}
      <Text style={styles.title}>{editingId === null ? 'Cadastro de funções e periodicidades' : 'Editar função e periodicidades'}</Text>
      <View pointerEvents={busy ? 'none' : 'auto'}>
      <View style={styles.formGrid}>
        <FormField label="Função" placeholder="Ex.: Pedreiro ou Soldador" value={name} onChangeText={setName} containerStyle={styles.topField} />
        <FormField label="Descrição" placeholder="Descrição da atividade" value={description} onChangeText={setDescription} containerStyle={styles.topField} />
      </View>

      <View style={styles.epiPanel}>
        <Text style={styles.panelTitle}>EPIs e periodicidades desta função</Text>
        <Text style={styles.help}>Selecione o EPI, informe a periodicidade e clique em “Adicionar EPI à função”. Repita para adicionar mais EPIs. Use “Outros (sem prazo)” quando não houver prazo obrigatório.</Text>
        <View style={styles.formGrid}>
          <FormField label="Pesquisar EPI pelo número do CA" placeholder="Digite o número do CA" keyboardType="numeric" value={ca} onChangeText={setCa} />
          <AppButton title="Pesquisar EPI" disabled={equipment.loading || !ca.trim()} onPress={() => { setSelectedEpi('Selecione'); if (ca.trim() === searchCa) void equipment.refresh(); else setSearchCa(ca.trim()); }} />
          {equipment.loading && <Text>Carregando EPIs...</Text>}
          {!searchCa && <Text>Pesquise pelo número do CA para escolher um EPI.</Text>}
          {!equipment.loading && searchCa !== '' && equipment.items.length === 0 && <Text>Nenhum EPI encontrado para este CA.</Text>}
          <SelectField label="EPI cadastrado" value={selectedEpi} options={epiOptions} onValueChange={setSelectedEpi} />
          <SelectField label="Periodicidade" value={periodicity} options={periodicityOptions} onValueChange={setPeriodicity} />
          <FormField label="Quantidade de dias" placeholder="Ex.: 7 ou 90" value={days} onChangeText={setDays} keyboardType="numeric" editable={periodicity === 'Prazo em dias'} containerStyle={styles.daysField} />
        </View>
        <View style={styles.addAction}><AppButton title="Adicionar EPI à função" onPress={addEpi} /></View>
        {functionEpis.length === 0 ? <Text style={styles.emptyText}>Nenhum EPI adicionado à função.</Text> : <View style={styles.epiList}><Text style={styles.help}>{functionEpis.length} EPI(s) adicionado(s). Pesquise outro CA para adicionar mais.</Text>{functionEpis.map((epi) => <View key={epi.id} style={styles.epiItem}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.epiText}>{epi.name}</Text>
            <SelectField label="Periodicidade do EPI" value={epi.periodicity} options={periodicityOptions} onValueChange={value => setFunctionEpis(current => current.map(item => item.id === epi.id ? { ...item, periodicity: value, days: value === 'Prazo em dias' ? item.days ?? '' : undefined } : item))} />
            {epi.periodicity === 'Prazo em dias' && <FormField label="Quantidade de dias" keyboardType="numeric" value={epi.days ?? ''} onChangeText={value => setFunctionEpis(current => current.map(item => item.id === epi.id ? { ...item, days: value } : item))} />}
          </View>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => setFunctionEpis((current) => current.filter((item) => item.id !== epi.id))}><Text style={styles.removeText}>Remover</Text></Pressable>
        </View>)}</View>}
      </View>
      </View>

      <View style={styles.submitAction}><AppButton title={busy ? 'Aguarde...' : editingId === null ? 'Cadastrar função' : 'Salvar alterações'} onPress={saveFunction} disabled={busy} /></View>
      {editingId !== null && <View style={styles.cancelAction}><AppButton title="Cancelar edição" variant="secondary" onPress={() => { clearForm(); setError(''); }} disabled={busy} /></View>}
      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => { if (!busy) setDeleteTarget(null); }}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.confirmation}>
            <Text style={styles.modalTitle}>Excluir função?</Text>
            <Text style={styles.modalDescription}>Deseja excluir a função “{deleteTarget?.name}” e suas associações de EPIs e periodicidades? Esta ação não pode ser desfeita.</Text>
            <View style={styles.modalActions}>
              <AppButton title="Cancelar" variant="secondary" disabled={busy} onPress={() => setDeleteTarget(null)} />
              <AppButton title={busy ? 'Excluindo...' : 'Confirmar exclusão'} variant="danger" disabled={busy} onPress={() => void deleteFunction()} />
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{tableHeaders.map((header) => <Text key={header} style={[styles.cell, header === 'EPIs e periodicidades' && styles.epiCell, header === 'Ação' && styles.actionHeader, styles.headerCell]}>{header}</Text>)}</View>
        {functions.map((item) => <View key={item.id} style={styles.row}><Text style={styles.cell}>{item.name}</Text><Text style={styles.cell}>{item.description}</Text><View style={[styles.cell, styles.epiCell, styles.tableEpis]}>{item.epis.length === 0 ? <Text style={styles.emptyCell}>Nenhum EPI associado</Text> : item.epis.map(epi => <View key={epi.id} style={styles.tableEpi}><Text style={styles.tableEpiName}>{epi.name}</Text><Text style={styles.tableEpiPeriodicity}>{formatPeriodicity(epi)}</Text></View>)}</View><View style={styles.actionCell}><AppButton title="Editar" onPress={() => editFunction(item)} disabled={busy} /><AppButton title="Excluir" variant="danger" onPress={() => { setError(''); setDeleteTarget(item); }} disabled={busy} /></View></View>)}
      </View></ScrollView></View>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmation: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 },
  modalTitle: { color: '#12355B', fontSize: 24, fontWeight: '700' },
  modalDescription: { color: '#536B83', fontSize: 14, lineHeight: 21, marginBottom: 20, marginTop: 6 },
  modalActions: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
  tableEpis: { gap: 10, paddingBottom: 13 },
  tableEpi: { gap: 4 },
  tableEpiName: { color: '#162B45', fontSize: 13, fontWeight: '600' },
  tableEpiPeriodicity: { color: '#536B83', fontSize: 12 },
  emptyCell: { color: '#536B83', fontSize: 12 },
  actionHeader: { minWidth: 170 },
  content: { alignSelf: 'center', padding: 16, width: '100%' }, title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 20 }, formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, topField: { flexBasis: 280 }, epiPanel: { backgroundColor: '#EEF5FC', borderColor: '#D5E4F3', borderRadius: 9, borderWidth: 1, marginTop: 15, padding: 14 }, panelTitle: { color: '#12355B', fontSize: 18, fontWeight: '700' }, help: { color: '#536B83', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 18 }, daysField: { flexBasis: 180 }, addAction: { alignSelf: 'flex-start', marginTop: 13 }, emptyText: { color: '#536B83', fontSize: 12, marginTop: 13 }, epiList: { gap: 7, marginTop: 13 }, epiItem: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D5E4F3', borderRadius: 6, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 9 }, epiText: { color: '#162B45', flex: 1, fontSize: 13, paddingRight: 12 }, removeText: { color: '#C64032', fontSize: 13, fontWeight: '700' }, submitAction: { alignSelf: 'flex-start', marginTop: 13 }, cancelAction: { alignSelf: 'flex-start', marginTop: 8 }, table: { borderColor: '#D5E4F3', borderWidth: 1, marginTop: 14, width: '100%' }, tableScroll: { flexGrow: 1, minWidth: '100%' }, tableContent: { minWidth: 1140, width: '100%' }, row: { flexDirection: 'row', minHeight: 48, width: '100%' }, tableHeader: { backgroundColor: '#1677D2', minHeight: 36 }, cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 220, paddingHorizontal: 9, paddingTop: 13 }, epiCell: { minWidth: 310 }, headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 10 }, actionCell: { alignItems: 'center', borderRightColor: '#D5E4F3', borderRightWidth: 1, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minWidth: 170, paddingHorizontal: 8 },
});
