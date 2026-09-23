import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, FormField, PageCard, SelectField } from './ui';

type Periodicity = 'Prazo em dias' | 'Outros (sem prazo)';
type FunctionEpi = { id: number; name: string; periodicity: Periodicity; days?: string };
type JobFunction = { id: number; name: string; description: string; epis: FunctionEpi[] };

const epiOptions = ['Selecione', 'Capacete', 'Luva de proteção', 'Óculos de segurança'];
const periodicityOptions: Periodicity[] = ['Prazo em dias', 'Outros (sem prazo)'];
const tableHeaders = ['Função', 'Descrição', 'EPIs e periodicidades', 'Ação'];

const formatEpis = (epis: FunctionEpi[]) => epis.map((epi) => `${epi.name}: ${epi.periodicity === 'Prazo em dias' ? `${epi.days} dia(s)` : 'sem prazo'}`).join(' • ');

export function FunctionPeriodicityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEpi, setSelectedEpi] = useState(epiOptions[0]);
  const [periodicity, setPeriodicity] = useState<Periodicity>('Prazo em dias');
  const [days, setDays] = useState('');
  const [functionEpis, setFunctionEpis] = useState<FunctionEpi[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [functions, setFunctions] = useState<JobFunction[]>([
    { id: 1, name: 'Programador', description: 'desenvolve', epis: [{ id: 1, name: 'Capacete', periodicity: 'Prazo em dias', days: '10' }] },
  ]);

  const clearForm = () => { setName(''); setDescription(''); setSelectedEpi('Selecione'); setPeriodicity('Prazo em dias'); setDays(''); setFunctionEpis([]); setEditingId(null); };

  const addEpi = () => {
    if (selectedEpi === 'Selecione') { Alert.alert('Selecione um EPI', 'Escolha o EPI que será associado à função.'); return; }
    if (periodicity === 'Prazo em dias' && !days.trim()) { Alert.alert('Informe o prazo', 'Digite a quantidade de dias para este EPI.'); return; }
    if (functionEpis.some((epi) => epi.name === selectedEpi)) { Alert.alert('EPI já adicionado', 'Remova o EPI atual antes de adicioná-lo novamente.'); return; }
    setFunctionEpis((current) => [...current, { id: Date.now(), name: selectedEpi, periodicity, days: periodicity === 'Prazo em dias' ? days.trim() : undefined }]);
    setSelectedEpi('Selecione'); setPeriodicity('Prazo em dias'); setDays('');
  };

  const saveFunction = () => {
    if (!name.trim()) { Alert.alert('Informe a função', 'Digite o nome da função antes de cadastrar.'); return; }
    if (functionEpis.length === 0) { Alert.alert('Adicione um EPI', 'Inclua ao menos um EPI e sua periodicidade.'); return; }
    const entry = { id: editingId ?? Date.now(), name: name.trim(), description: description.trim() || '-', epis: functionEpis };
    setFunctions((current) => editingId === null ? [...current, entry] : current.map((item) => item.id === editingId ? entry : item));
    clearForm();
  };

  const editFunction = (item: JobFunction) => { setName(item.name); setDescription(item.description === '-' ? '' : item.description); setFunctionEpis(item.epis); setEditingId(item.id); };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      <Text style={styles.title}>Cadastro de funções e periodicidades</Text>
      <View style={styles.formGrid}>
        <FormField label="Função" placeholder="Ex.: Pedreiro ou Soldador" value={name} onChangeText={setName} containerStyle={styles.topField} />
        <FormField label="Descrição" placeholder="Descrição da atividade" value={description} onChangeText={setDescription} containerStyle={styles.topField} />
      </View>

      <View style={styles.epiPanel}>
        <Text style={styles.panelTitle}>EPIs e periodicidades desta função</Text>
        <Text style={styles.help}>Selecione o EPI e determine o prazo de troca. Use “Outros (sem prazo)” quando não houver prazo obrigatório.</Text>
        <View style={styles.formGrid}>
          <SelectField label="EPI cadastrado" value={selectedEpi} options={epiOptions} onValueChange={setSelectedEpi} />
          <SelectField label="Periodicidade" value={periodicity} options={periodicityOptions} onValueChange={setPeriodicity} />
          <FormField label="Quantidade de dias" placeholder="Ex.: 7 ou 90" value={days} onChangeText={setDays} keyboardType="numeric" editable={periodicity === 'Prazo em dias'} containerStyle={styles.daysField} />
        </View>
        <View style={styles.addAction}><AppButton title="Adicionar EPI à função" onPress={addEpi} /></View>
        {functionEpis.length === 0 ? <Text style={styles.emptyText}>Nenhum EPI adicionado à função.</Text> : <View style={styles.epiList}>{functionEpis.map((epi) => <View key={epi.id} style={styles.epiItem}><Text style={styles.epiText}>{formatEpis([epi])}</Text><Pressable accessibilityRole="button" onPress={() => setFunctionEpis((current) => current.filter((item) => item.id !== epi.id))}><Text style={styles.removeText}>Remover</Text></Pressable></View>)}</View>}
      </View>

      <View style={styles.submitAction}><AppButton title={editingId === null ? 'Cadastrar função' : 'Salvar alterações'} onPress={saveFunction} /></View>
      {editingId !== null && <View style={styles.cancelAction}><AppButton title="Cancelar edição" variant="secondary" onPress={clearForm} /></View>}
      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{tableHeaders.map((header) => <Text key={header} style={[styles.cell, styles.headerCell]}>{header}</Text>)}</View>
        {functions.map((item) => <View key={item.id} style={styles.row}><Text style={styles.cell}>{item.name}</Text><Text style={styles.cell}>{item.description}</Text><Text style={[styles.cell, styles.epiCell]}>{formatEpis(item.epis)}</Text><View style={styles.actionCell}><AppButton title="Editar" onPress={() => editFunction(item)} /><AppButton title="Excluir" variant="danger" onPress={() => setFunctions((current) => current.filter((entry) => entry.id !== item.id))} /></View></View>)}
      </View></ScrollView></View>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', padding: 16, width: '100%' }, title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 20 }, formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, topField: { flexBasis: 280 }, epiPanel: { backgroundColor: '#EEF5FC', borderColor: '#D5E4F3', borderRadius: 9, borderWidth: 1, marginTop: 15, padding: 14 }, panelTitle: { color: '#12355B', fontSize: 18, fontWeight: '700' }, help: { color: '#536B83', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 18 }, daysField: { flexBasis: 180 }, addAction: { alignSelf: 'flex-start', marginTop: 13 }, emptyText: { color: '#536B83', fontSize: 12, marginTop: 13 }, epiList: { gap: 7, marginTop: 13 }, epiItem: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#D5E4F3', borderRadius: 6, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 9 }, epiText: { color: '#162B45', flex: 1, fontSize: 13, paddingRight: 12 }, removeText: { color: '#C64032', fontSize: 13, fontWeight: '700' }, submitAction: { alignSelf: 'flex-start', marginTop: 13 }, cancelAction: { alignSelf: 'flex-start', marginTop: 8 }, table: { borderColor: '#D5E4F3', borderWidth: 1, marginTop: 14, width: '100%' }, tableScroll: { flexGrow: 1, minWidth: '100%' }, tableContent: { minWidth: 1140, width: '100%' }, row: { flexDirection: 'row', minHeight: 48, width: '100%' }, tableHeader: { backgroundColor: '#1677D2', minHeight: 36 }, cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 220, paddingHorizontal: 9, paddingTop: 13 }, epiCell: { minWidth: 310 }, headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 10 }, actionCell: { alignItems: 'center', borderRightColor: '#D5E4F3', borderRightWidth: 1, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minWidth: 170, paddingHorizontal: 8 },
});
