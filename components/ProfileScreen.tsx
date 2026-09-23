import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton, FormField, PageCard } from './ui';

type ProfileScreenProps = { onBack: () => void; onLogout: () => void };

export function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const [name, setName] = useState('Gustavo');
  const [email, setEmail] = useState('gustavo@empresa.com.br');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveProfile = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe seu nome e e-mail para salvar o perfil.');
      return;
    }
    Alert.alert('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
  };

  const changePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Preencha os dados', 'Informe a senha atual, a nova senha e a confirmação.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Senha muito curta', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'A confirmação deve ser igual à nova senha.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Senha atualizada', 'Sua senha foi alterada com sucesso.');
  };

  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.topBar}><Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹ Voltar</Text></Pressable></View>
    <View style={styles.intro}><View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().charAt(0).toUpperCase() || 'U'}</Text></View><View><Text style={styles.title}>Meu perfil</Text><Text style={styles.subtitle}>Gerencie suas informações e a segurança da conta.</Text></View></View>

    <PageCard style={styles.card}>
      <Text style={styles.sectionTitle}>Informações pessoais</Text>
      <View style={styles.formGrid}>
        <FormField label="Nome completo" value={name} onChangeText={setName} containerStyle={styles.nameField} />
        <FormField label="E-mail corporativo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} containerStyle={styles.emailField} />
        <FormField label="Telefone" keyboardType="phone-pad" placeholder="(00) 00000-0000" value={phone} onChangeText={setPhone} containerStyle={styles.phoneField} />
      </View>
      <View style={styles.actions}><AppButton title="Salvar alterações" onPress={saveProfile} /></View>
    </PageCard>

    <PageCard style={styles.card}>
      <Text style={styles.sectionTitle}>Segurança</Text>
      <Text style={styles.sectionDescription}>Altere sua senha periodicamente para manter sua conta protegida.</Text>
      <View style={styles.formGrid}>
        <PasswordField label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} />
        <PasswordField label="Nova senha" value={newPassword} onChangeText={setNewPassword} />
        <PasswordField label="Confirmar nova senha" value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>
      <View style={styles.actions}><AppButton title="Alterar senha" variant="secondary" onPress={changePassword} /></View>
    </PageCard>

    <PageCard style={[styles.card, styles.logoutCard]}>
      <View><Text style={styles.sectionTitle}>Encerrar sessão</Text><Text style={styles.sectionDescription}>Você precisará informar suas credenciais para acessar novamente.</Text></View>
      <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Sair da conta</Text></Pressable>
    </PageCard>
  </ScrollView>;
}

function PasswordField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.passwordField}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.passwordInput}><TextInput accessibilityLabel={label} secureTextEntry={!visible} value={value} onChangeText={onChangeText} style={styles.passwordTextInput} /><Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible((value) => !value)} hitSlop={8}><Text style={styles.visibilityText}>{visible ? 'Ocultar' : 'Mostrar'}</Text></Pressable></View></View>;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', maxWidth: 1272, padding: 16, paddingBottom: 32, width: '100%' },
  topBar: { marginBottom: 14 }, backButton: { alignSelf: 'flex-start', paddingVertical: 5 }, backText: { color: '#12355B', fontSize: 15, fontWeight: '700' },
  intro: { alignItems: 'center', flexDirection: 'row', gap: 13, marginBottom: 20 }, avatar: { alignItems: 'center', backgroundColor: '#1677D2', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 }, avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' }, title: { color: '#12355B', fontSize: 26, fontWeight: '700' }, subtitle: { color: '#536B83', fontSize: 14, marginTop: 3 },
  card: { marginBottom: 14 }, sectionTitle: { color: '#12355B', fontSize: 19, fontWeight: '700' }, sectionDescription: { color: '#536B83', fontSize: 14, lineHeight: 20, marginTop: 5 }, formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 20 }, nameField: { flexBasis: 300 }, emailField: { flexBasis: 360 }, phoneField: { flexBasis: 220 }, passwordField: { flexBasis: 260, flexGrow: 1, gap: 7 }, fieldLabel: { color: '#12355B', fontSize: 14, fontWeight: '700' }, passwordInput: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#AABFD4', borderRadius: 7, borderWidth: 1, flexDirection: 'row', height: 43, paddingRight: 12 }, passwordTextInput: { color: '#17251D', flex: 1, fontSize: 16, height: '100%', paddingHorizontal: 12 }, visibilityText: { color: '#12355B', fontSize: 13, fontWeight: '700' },
  actions: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 22 }, logoutCard: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between' }, logoutButton: { borderColor: '#C64032', borderRadius: 7, borderWidth: 1, minHeight: 42, justifyContent: 'center', paddingHorizontal: 15 }, logoutText: { color: '#C64032', fontSize: 14, fontWeight: '700' },
});
