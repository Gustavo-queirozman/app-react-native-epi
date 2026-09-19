import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { AuthLayout, authStyles } from './AuthLayout';
import { requestPasswordReset } from '../src/api/auth';

type ForgotPasswordScreenProps = { onBackToLogin: () => void };

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Informe seu e-mail', 'Digite o e-mail corporativo cadastrado para receber as instruções.');
      return;
    }

    try { await requestPasswordReset(email.trim()); setSubmitted(true); }
    catch (error) { Alert.alert('Não foi possível enviar o link', error instanceof Error ? error.message : 'Tente novamente.'); }
  };

  return <AuthLayout eyebrow="Recuperação de acesso" title="Esqueceu sua senha?" description="Informe seu e-mail corporativo e enviaremos um link para criar uma nova senha.">
    {submitted ? <View style={authStyles.feedbackBox}>
      <Text style={authStyles.feedbackTitle}>Verifique sua caixa de entrada</Text>
      <Text style={authStyles.feedbackText}>Enviamos as instruções de recuperação para {email.trim()}.</Text>
      <Pressable accessibilityRole="button" onPress={onBackToLogin} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Voltar para o login</Text></Pressable>
    </View> : <>
      <View style={authStyles.fields}>
        <View>
          <Text style={authStyles.label}>E-mail corporativo</Text>
          <TextInput accessibilityLabel="E-mail corporativo para recuperação de senha" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="nome@empresa.com.br" returnKeyType="send" onSubmitEditing={() => void handleResetPassword()} style={authStyles.input} value={email} />
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => void handleResetPassword()} style={authStyles.primaryButton}><Text style={authStyles.primaryButtonText}>Enviar link de recuperação</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onBackToLogin} style={authStyles.linkButton}><Text style={authStyles.linkText}>Voltar para o login</Text></Pressable>
    </>}
  </AuthLayout>;
}
