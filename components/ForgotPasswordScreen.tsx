import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { AuthLayout, authStyles } from './AuthLayout';
import { requestPasswordReset, resetPassword } from '../src/api/auth';

type ForgotPasswordScreenProps = { onBackToLogin: () => void };

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const completeReset = async () => {
    if (busy) return;
    if (!token.trim() || !email.trim() || password.length < 8 || password !== confirmation) { setMessage('Informe e-mail, token recebido e senhas iguais com pelo menos 8 caracteres.'); return; }
    setBusy(true); setMessage('');
    try { await resetPassword(email.trim(), token.trim(), password, confirmation); onBackToLogin(); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Falha ao redefinir senha.'); }
    finally { setBusy(false); }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Informe seu e-mail', 'Digite o e-mail corporativo cadastrado para receber as instruções.');
      return;
    }

    if (busy) return;
    setBusy(true); setMessage('');
    try { await requestPasswordReset(email.trim()); setSubmitted(true); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Tente novamente.'); }
    finally { setBusy(false); }
  };

  return <AuthLayout eyebrow="Recuperação de acesso" title="Esqueceu sua senha?" description="Informe seu e-mail corporativo e enviaremos um link para criar uma nova senha.">
    {!!message && <Text accessibilityRole="alert">{message}</Text>}
    <View style={authStyles.fields}>
      <Text>Já recebeu o link? Copie o token de recuperação e informe a nova senha.</Text>
      <TextInput accessibilityLabel="E-mail para redefinir senha" placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" style={authStyles.input} />
      <TextInput accessibilityLabel="Token de recuperação" placeholder="Token do link recebido" value={token} onChangeText={setToken} autoCapitalize="none" style={authStyles.input} />
      <TextInput accessibilityLabel="Nova senha" placeholder="Nova senha" secureTextEntry value={password} onChangeText={setPassword} style={authStyles.input} />
      <TextInput accessibilityLabel="Confirmar senha" placeholder="Confirmar senha" secureTextEntry value={confirmation} onChangeText={setConfirmation} style={authStyles.input} />
      <Pressable disabled={busy} onPress={completeReset} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Redefinir senha</Text></Pressable>
    </View>
    {submitted ? <View style={authStyles.feedbackBox}>
      <Text style={authStyles.feedbackTitle}>Verifique sua caixa de entrada</Text>
      <Text style={authStyles.feedbackText}>Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.</Text>
      <Pressable accessibilityRole="button" onPress={onBackToLogin} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Voltar para o login</Text></Pressable>
    </View> : <>
      <View style={authStyles.fields}>
        <View>
          <Text style={authStyles.label}>E-mail corporativo</Text>
          <TextInput accessibilityLabel="E-mail corporativo para recuperação de senha" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nome@empresa.com.br" returnKeyType="send" onSubmitEditing={() => void handleResetPassword()} style={authStyles.input} value={email} />
        </View>
      </View>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void handleResetPassword()} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Enviar link de recuperação</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onBackToLogin} style={authStyles.linkButton}><Text style={authStyles.linkText}>Voltar para o login</Text></Pressable>
    </>}
  </AuthLayout>;
}
