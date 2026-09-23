import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, FormField, PageCard } from './ui';

type Supplier = {
  id: number;
  businessName: string;
  tradeName: string;
  cnpj: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
};

const tableHeaders = ['Fornecedor', 'CNPJ', 'Contato', 'Telefone', 'E-mail', 'Localização', 'Ação'];

export function SupplierScreen() {
  const [businessName, setBusinessName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const clearForm = () => {
    setBusinessName(''); setTradeName(''); setCnpj(''); setContactName('');
    setPhone(''); setEmail(''); setCity(''); setState(''); setEditingId(null);
  };

  const saveSupplier = () => {
    if (!businessName.trim() || !cnpj.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Preencha os dados principais', 'Informe razão social, CNPJ, contato, telefone e e-mail para cadastrar o fornecedor.');
      return;
    }
    const supplier: Supplier = {
      id: editingId ?? Date.now(), businessName: businessName.trim(), tradeName: tradeName.trim(), cnpj: cnpj.trim(),
      contactName: contactName.trim(), phone: phone.trim(), email: email.trim(), city: city.trim(), state: state.trim().toUpperCase(),
    };
    setSuppliers((current) => editingId === null ? [...current, supplier] : current.map((item) => item.id === editingId ? supplier : item));
    clearForm();
  };

  const editSupplier = (supplier: Supplier) => {
    setBusinessName(supplier.businessName); setTradeName(supplier.tradeName); setCnpj(supplier.cnpj); setContactName(supplier.contactName);
    setPhone(supplier.phone); setEmail(supplier.email); setCity(supplier.city); setState(supplier.state); setEditingId(supplier.id);
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <PageCard>
      <Text style={styles.title}>Cadastro de fornecedor</Text>
      <Text style={styles.description}>Registre os dados de contato das empresas que fornecem EPIs e outros materiais.</Text>
      <View style={styles.formGrid}>
        <FormField label="Razão social *" placeholder="Ex.: Protege Equipamentos Ltda." value={businessName} onChangeText={setBusinessName} containerStyle={styles.businessNameField} />
        <FormField label="Nome fantasia" placeholder="Nome comercial" value={tradeName} onChangeText={setTradeName} containerStyle={styles.tradeNameField} />
        <FormField label="CNPJ *" placeholder="00.000.000/0000-00" value={cnpj} onChangeText={setCnpj} keyboardType="numeric" maxLength={18} containerStyle={styles.cnpjField} />
        <FormField label="Nome do contato *" placeholder="Responsável comercial" value={contactName} onChangeText={setContactName} containerStyle={styles.contactField} />
        <FormField label="Telefone *" placeholder="(00) 00000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={15} containerStyle={styles.phoneField} />
        <FormField label="E-mail *" placeholder="contato@fornecedor.com.br" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" containerStyle={styles.emailField} />
        <FormField label="Cidade" placeholder="Cidade" value={city} onChangeText={setCity} containerStyle={styles.cityField} />
        <FormField label="UF" placeholder="Ex.: MG" value={state} onChangeText={setState} autoCapitalize="characters" maxLength={2} containerStyle={styles.stateField} />
      </View>
      <Text style={styles.required}>* Campos obrigatórios</Text>
      <View style={styles.actions}>
        <AppButton title={editingId === null ? 'Cadastrar fornecedor' : 'Salvar alterações'} onPress={saveSupplier} />
        {editingId !== null && <AppButton title="Cancelar edição" variant="secondary" onPress={clearForm} />}
      </View>
      <View style={styles.table}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}><View style={styles.tableContent}>
        <View style={[styles.row, styles.tableHeader]}>{tableHeaders.map((header) => <Text key={header} style={[styles.cell, styles.headerCell, header === 'Fornecedor' && styles.supplierColumn]}>{header}</Text>)}</View>
        {suppliers.length === 0
          ? <View style={styles.emptyRow}><Text style={styles.emptyText}>Nenhum fornecedor cadastrado.</Text></View>
          : suppliers.map((supplier) => <View key={supplier.id} style={styles.row}>
            {[supplier.tradeName || supplier.businessName, supplier.cnpj, supplier.contactName, supplier.phone, supplier.email, [supplier.city, supplier.state].filter(Boolean).join(' - ') || '-'].map((value, index) => <Text key={`${supplier.id}-${index}`} style={[styles.cell, index === 0 && styles.supplierColumn]}>{value}</Text>)}
            <View style={styles.actionCell}><AppButton title="Editar" onPress={() => editSupplier(supplier)} /><AppButton title="Excluir" variant="danger" onPress={() => setSuppliers((current) => current.filter((item) => item.id !== supplier.id))} /></View>
          </View>)}
      </View></ScrollView></View>
    </PageCard>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', padding: 16, width: '100%' },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700' },
  description: { color: '#536B83', fontSize: 14, lineHeight: 21, marginBottom: 20, marginTop: 6 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  businessNameField: { flexBasis: 390 }, tradeNameField: { flexBasis: 290 }, cnpjField: { flexBasis: 220 }, contactField: { flexBasis: 270 }, phoneField: { flexBasis: 190 }, emailField: { flexBasis: 290 }, cityField: { flexBasis: 240 }, stateField: { flexBasis: 100, flexGrow: 0 },
  required: { color: '#536B83', fontSize: 12, marginTop: 12 },
  actions: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
  table: { borderColor: '#D5E4F3', borderWidth: 1, marginTop: 18, width: '100%' },
  tableScroll: { flexGrow: 1, minWidth: '100%' }, tableContent: { minWidth: 1010, width: '100%' },
  row: { flexDirection: 'row', minHeight: 48, width: '100%' }, tableHeader: { backgroundColor: '#1677D2', minHeight: 36 },
  cell: { borderRightColor: '#D5E4F3', borderRightWidth: 1, color: '#162B45', flex: 1, fontSize: 13, minWidth: 130, paddingHorizontal: 9, paddingTop: 13 }, supplierColumn: { minWidth: 190 },
  headerCell: { color: '#FFFFFF', fontWeight: '700', paddingTop: 10 }, actionCell: { alignItems: 'center', borderRightColor: '#D5E4F3', borderRightWidth: 1, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minWidth: 170, paddingHorizontal: 8 },
  emptyRow: { alignItems: 'center', justifyContent: 'center', minHeight: 70, minWidth: 1010, paddingHorizontal: 16, width: '100%' }, emptyText: { color: '#536B83', fontSize: 14 },
});
