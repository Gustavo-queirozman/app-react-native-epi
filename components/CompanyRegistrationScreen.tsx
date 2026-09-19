import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AuthLayout, authStyles } from './AuthLayout';
import { registerCompany } from '../src/api/auth';

type CompanyRegistrationScreenProps = { onBackToLogin: () => void; onRegistered: () => void };

export function CompanyRegistrationScreen({ onBackToLogin, onRegistered }: CompanyRegistrationScreenProps) {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const register = async () => {
    if (!companyName.trim() || !cnpj.trim() || !responsibleName.trim() || !email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os dados para cadastrar a empresa.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Aceite necessário', 'Leia e aceite os termos para continuar.');
      return;
    }
    try { await registerCompany({ companyName: companyName.trim(), cnpj: cnpj.trim(), responsibleName: responsibleName.trim(), email: email.trim(), password }); onRegistered(); }
    catch (error) { Alert.alert('Não foi possível criar a conta', error instanceof Error ? error.message : 'Tente novamente.'); }
  };

  return <AuthLayout eyebrow="Comece agora" title="Cadastre sua empresa" description="Leva só alguns minutos para organizar a segurança do seu time.">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <View style={authStyles.fields}>
        <View><Text style={authStyles.label}>Nome da empresa</Text><TextInput accessibilityLabel="Nome da empresa" onChangeText={setCompanyName} placeholder="Ex.: Construtora Horizonte Ltda." style={authStyles.input} value={companyName} /></View>
        <View><Text style={authStyles.label}>CNPJ</Text><TextInput accessibilityLabel="CNPJ" keyboardType="numeric" maxLength={18} onChangeText={setCnpj} placeholder="00.000.000/0000-00" style={authStyles.input} value={cnpj} /></View>
        <View><Text style={authStyles.label}>Nome do responsável</Text><TextInput accessibilityLabel="Nome do responsável" autoComplete="name" onChangeText={setResponsibleName} placeholder="Seu nome completo" style={authStyles.input} value={responsibleName} /></View>
        <View><Text style={authStyles.label}>E-mail corporativo</Text><TextInput accessibilityLabel="E-mail corporativo" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nome@empresa.com.br" style={authStyles.input} value={email} /></View>
        <View><Text style={authStyles.label}>Crie uma senha</Text><TextInput accessibilityLabel="Crie uma senha" autoComplete="new-password" onChangeText={setPassword} placeholder="No mínimo 8 caracteres" secureTextEntry style={authStyles.input} value={password} /></View>
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: acceptTerms }} onPress={() => setAcceptTerms(!acceptTerms)} style={[authStyles.checkRow, { alignItems: 'flex-start', marginTop: 19 }]}><View style={[authStyles.check, acceptTerms && authStyles.checkSelected]}>{acceptTerms && <Text style={authStyles.checkMark}>✓</Text>}</View><Text style={[authStyles.checkLabel, { flex: 1, lineHeight: 19 }]}>Li e concordo com os <Text style={authStyles.footerLink}>Termos de Uso</Text> e a <Text style={authStyles.footerLink}>Política de Privacidade</Text>.</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => void register()} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Criar conta da empresa</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onBackToLogin} style={authStyles.linkButton}><Text style={authStyles.linkText}>Já tenho uma conta</Text></Pressable>
    </ScrollView>
  </AuthLayout>;
}
