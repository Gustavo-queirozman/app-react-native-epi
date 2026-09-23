import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { AuthLayout, authStyles } from './AuthLayout';
import { biometrics } from '../src/security/biometrics';
import { session } from '../src/api/session';

type LoginScreenProps = { onLogin: () => void; onRegister: () => void; onForgotPassword: () => void };

// Temporary local session while the authentication API is not available yet.
const STATIC_ACCESS_TOKEN = 'handsafe-static-access';
const STATIC_EMAIL = 'acesso@handsafe.local';

export function LoginScreen({ onLogin, onRegister, onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => { void biometrics.canUseForLogin().then(setBiometricAvailable); }, []);

  const handleLogin = async () => {
    try {
      await session.setAccessToken(STATIC_ACCESS_TOKEN);
      if (remember) {
        const biometricResult = await biometrics.enableLogin(email.trim() || STATIC_EMAIL, STATIC_ACCESS_TOKEN);
        if (!biometricResult.success) Alert.alert('Biometria não ativada', biometricResult.message);
      }
    }
    catch (error) { Alert.alert('Sessão local não salva', error instanceof Error ? error.message : 'O acesso continuará normalmente.'); }
    onLogin();
  };

  const handleBiometricLogin = async () => {
    const result = await biometrics.authenticateLogin();
    if (result.success) onLogin();
    else Alert.alert('Não foi possível entrar', result.message);
  };

  return <AuthLayout eyebrow="Acesso à plataforma" title="Olá, que bom ver você!" description="Entre com seus dados para acessar a gestão da sua empresa.">
    <View style={authStyles.fields}>
      <View><Text style={authStyles.label}>E-mail corporativo</Text><TextInput accessibilityLabel="E-mail corporativo" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nome@empresa.com.br" style={authStyles.input} value={email} /></View>
      <View><Text style={authStyles.label}>Senha</Text><View style={authStyles.inputRow}><TextInput accessibilityLabel="Senha" autoComplete="password" onChangeText={setPassword} placeholder="Digite sua senha" secureTextEntry={!showPassword} style={authStyles.inputWithButton} value={password} /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword(!showPassword)} style={authStyles.iconButton}><Text style={authStyles.icon}>{showPassword ? '◉' : '◌'}</Text></Pressable></View></View>
    </View>
    <View style={authStyles.inlineRow}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={authStyles.checkRow}><View style={[authStyles.check, remember && authStyles.checkSelected]}>{remember && <Text style={authStyles.checkMark}>✓</Text>}</View><Text style={authStyles.checkLabel}>Lembrar de mim</Text></Pressable><Pressable accessibilityRole="button" onPress={onForgotPassword}><Text style={authStyles.linkText}>Esqueci a senha</Text></Pressable></View>
    <Text style={authStyles.helperText}>Acesso temporário: clique em entrar para acessar, sem consultar a API.</Text>
    <Pressable accessibilityRole="button" onPress={() => void handleLogin()} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Entrar na plataforma</Text></Pressable>
    {biometricAvailable && <Pressable accessibilityRole="button" accessibilityLabel="Entrar com biometria" onPress={() => void handleBiometricLogin()} style={authStyles.secondaryButton}><Text style={authStyles.secondaryButtonText}>Entrar com biometria</Text></Pressable>}
    <View style={authStyles.formFooter}><Text style={authStyles.footerText}>Ainda não tem uma conta?{' '}<Text accessibilityRole="button" onPress={onRegister} style={authStyles.footerLink}>Cadastre sua empresa</Text></Text></View>
  </AuthLayout>;
}
