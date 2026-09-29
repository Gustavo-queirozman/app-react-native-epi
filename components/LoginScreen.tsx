import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { AuthLayout, authStyles } from './AuthLayout';
import { biometrics } from '../src/security/biometrics';
import { session } from '../src/api/session';
import { login } from '../src/api/auth';
import { ApiError, apiFetch } from '../src/api/client';
import { endpoints } from '../src/api/endpoints';

type LoginScreenProps = { onLogin: () => void; onRegister: () => void; onForgotPassword: () => void };

export function LoginScreen({ onLogin, onRegister, onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  useEffect(() => { void biometrics.canUseForLogin().then(setBiometricAvailable).catch(() => setBiometricAvailable(false)); }, []);

  const handleLogin = async () => {
    if (submitting.current) return;
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !password) {
      setError('Informe um e-mail válido e sua senha.');
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      const token = await login(normalizedEmail, password);
      if (remember) {
        try {
          const biometricResult = await biometrics.enableLogin(normalizedEmail, token);
          if (!biometricResult.success) Alert.alert('Biometria não ativada', biometricResult.message);
        } catch { Alert.alert('Biometria não ativada', 'Você pode continuar usando e-mail e senha.'); }
      }
      onLogin();
    }
    catch (error) {
      setError(error instanceof ApiError && error.status === 401 ? 'E-mail ou senha incorretos.' : error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    }
    finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      const result = await biometrics.authenticateLogin();
      if (!result.success) { setError(result.message ?? 'Não foi possível confirmar a biometria.'); return; }
      await apiFetch(endpoints.auth.profile);
      onLogin();
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setBiometricAvailable(false);
        setError('Sua sessão expirou. Entre novamente com e-mail e senha.');
        await session.clear().catch(() => undefined);
      } else {
        setError(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return <AuthLayout eyebrow="Acesso à plataforma" title="Olá, que bom ver você!" description="Entre com seus dados para acessar a gestão da sua empresa.">
    <View style={authStyles.fields}>
      <View><Text style={authStyles.label}>E-mail corporativo</Text><TextInput accessibilityLabel="E-mail corporativo" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nome@empresa.com.br" style={authStyles.input} value={email} /></View>
      <View><Text style={authStyles.label}>Senha</Text><View style={authStyles.inputRow}><TextInput accessibilityLabel="Senha" autoComplete="password" onChangeText={setPassword} placeholder="Digite sua senha" secureTextEntry={!showPassword} style={authStyles.inputWithButton} value={password} /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword(!showPassword)} style={authStyles.iconButton}><Text style={authStyles.icon}>{showPassword ? '◉' : '◌'}</Text></Pressable></View></View>
    </View>
    <View style={authStyles.inlineRow}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={authStyles.checkRow}><View style={[authStyles.check, remember && authStyles.checkSelected]}>{remember && <Text style={authStyles.checkMark}>✓</Text>}</View><Text style={authStyles.checkLabel}>Lembrar de mim</Text></Pressable><Pressable accessibilityRole="button" onPress={onForgotPassword}><Text style={authStyles.linkText}>Esqueci a senha</Text></Pressable></View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={authStyles.error}>{error}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={() => void handleLogin()} style={[authStyles.primaryButton, loading && { opacity: 0.6 }]}><Text style={authStyles.primaryButtonText}>{loading ? 'Entrando...' : 'Entrar na plataforma'}</Text></Pressable>
    {biometricAvailable && <Pressable accessibilityRole="button" accessibilityLabel="Entrar com biometria" disabled={loading} onPress={() => void handleBiometricLogin()} style={authStyles.secondaryButton}><Text style={authStyles.secondaryButtonText}>Entrar com biometria</Text></Pressable>}
    <View style={authStyles.formFooter}><Text style={authStyles.footerText}>Ainda não tem uma conta?{' '}<Text accessibilityRole="button" onPress={onRegister} style={authStyles.footerLink}>Cadastre sua empresa</Text></Text></View>
  </AuthLayout>;
}
