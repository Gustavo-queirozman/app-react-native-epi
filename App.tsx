import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AlertsScreen } from './components/AlertsScreen';
import { AppHeader, type ScreenName } from './components/AppHeader';
import { DeliveryScreen, type Delivery } from './components/DeliveryScreen';
import { DeliveryRecordScreen } from './components/DeliveryRecordScreen';
import { FunctionPeriodicityScreen } from './components/FunctionPeriodicityScreen';
import { PageCard } from './components/ui';
import { StockScreen } from './components/StockScreen';
import { WorkerScreen } from './components/WorkerScreen';
import { CompanyRegistrationScreen } from './components/CompanyRegistrationScreen';
import { LoginScreen } from './components/LoginScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SupplierScreen } from './components/SupplierScreen';
import { PurchaseScreen } from './components/PurchaseScreen';
import { OfflineProvider } from './src/offline/OfflineProvider';
import { session } from './src/api/session';

const screenTitles: Record<Exclude<ScreenName, 'Funções e periodicidades' | 'Trabalhadores' | 'Fornecedores' | 'Compras'>, string> = { Painel: 'Painel', Estoque: 'Estoque', Entrega: 'Entrega de EPIs', Ficha: 'Ficha de entrega', Alertas: 'Alertas' };

function ComingSoonScreen({ screen }: { screen: Exclude<ScreenName, 'Funções e periodicidades' | 'Trabalhadores' | 'Fornecedores' | 'Compras'> }) {
  return <ScrollView contentContainerStyle={styles.placeholderContent}><PageCard><Text style={styles.placeholderTitle}>{screenTitles[screen]}</Text><Text style={styles.placeholderText}>Esta área está pronta para receber os dados e fluxos de {screen.toLowerCase()}.</Text></PageCard></ScrollView>;
}

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'forgot-password' | 'register' | 'app'>('login');
  const [activeScreen, setActiveScreen] = useState<ScreenName>('Painel');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
  const logout = () => setIsLogoutConfirmationOpen(true);
  const confirmLogout = () => {
    setIsLogoutConfirmationOpen(false);
    setIsProfileOpen(false);
    setActiveScreen('Painel');
    void session.clear();
    setAuthScreen('login');
  };
  const content = authScreen === 'login'
    ? <SafeAreaView style={styles.authSafeArea}><StatusBar style="light" /><LoginScreen onForgotPassword={() => setAuthScreen('forgot-password')} onLogin={() => setAuthScreen('app')} onRegister={() => setAuthScreen('register')} /></SafeAreaView>
    : authScreen === 'forgot-password'
      ? <SafeAreaView style={styles.authSafeArea}><StatusBar style="light" /><ForgotPasswordScreen onBackToLogin={() => setAuthScreen('login')} /></SafeAreaView>
    : authScreen === 'register'
      ? <SafeAreaView style={styles.authSafeArea}><StatusBar style="light" /><CompanyRegistrationScreen onBackToLogin={() => setAuthScreen('login')} onRegistered={() => setAuthScreen('app')} /></SafeAreaView>
      : <SafeAreaView style={styles.safeArea}><StatusBar style="light" /><AppHeader activeScreen={activeScreen} onChangeScreen={(screen) => { setActiveScreen(screen); setIsProfileOpen(false); }} onOpenProfile={() => setIsProfileOpen(true)} onLogout={logout} /><View style={styles.content}>{isProfileOpen ? <ProfileScreen onBack={() => setIsProfileOpen(false)} onLogout={logout} /> : activeScreen === 'Painel' ? <DashboardScreen onNavigate={(screen) => setActiveScreen(screen)} /> : activeScreen === 'Funções e periodicidades' ? <FunctionPeriodicityScreen /> : activeScreen === 'Trabalhadores' ? <WorkerScreen /> : activeScreen === 'Fornecedores' ? <SupplierScreen /> : activeScreen === 'Compras' ? <PurchaseScreen /> : activeScreen === 'Estoque' ? <StockScreen /> : activeScreen === 'Entrega' ? <DeliveryScreen deliveries={deliveries} onRegisterDelivery={(delivery) => setDeliveries((current) => [delivery, ...current])} /> : activeScreen === 'Ficha' ? <DeliveryRecordScreen deliveries={deliveries} /> : activeScreen === 'Alertas' ? <AlertsScreen /> : <ComingSoonScreen screen={activeScreen} />}</View></SafeAreaView>;

  return <SafeAreaProvider><OfflineProvider>{content}<Modal transparent animationType="fade" visible={isLogoutConfirmationOpen} onRequestClose={() => setIsLogoutConfirmationOpen(false)}>
    <View style={styles.modalOverlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar confirmação de saída" onPress={() => setIsLogoutConfirmationOpen(false)} style={StyleSheet.absoluteFill} />
      <View accessibilityViewIsModal style={styles.logoutModal}>
        <Text style={styles.logoutModalTitle}>Sair da conta?</Text>
        <Text style={styles.logoutModalText}>Deseja encerrar sua sessão agora?</Text>
        <View style={styles.logoutModalActions}>
          <Pressable accessibilityRole="button" onPress={() => setIsLogoutConfirmationOpen(false)} style={styles.cancelLogoutButton}><Text style={styles.cancelLogoutText}>Cancelar</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={confirmLogout} style={styles.confirmLogoutButton}><Text style={styles.confirmLogoutText}>Sair</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal></OfflineProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F5C37' }, authSafeArea: { flex: 1, backgroundColor: '#0F5C37' }, content: { flex: 1, backgroundColor: '#F4F7F5' }, placeholderContent: { alignSelf: 'center', flexGrow: 1, maxWidth: 1272, padding: 20, width: '100%' }, placeholderTitle: { color: '#064F2E', fontSize: 24, fontWeight: '700', marginBottom: 8 }, placeholderText: { color: '#53645B', fontSize: 15, lineHeight: 22 }, modalOverlay: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.46)', flex: 1, justifyContent: 'center', padding: 20 }, logoutModal: { backgroundColor: '#FFFFFF', borderRadius: 12, maxWidth: 400, padding: 24, width: '100%' }, logoutModalTitle: { color: '#123B28', fontSize: 21, fontWeight: '700' }, logoutModalText: { color: '#53645B', fontSize: 15, lineHeight: 22, marginTop: 8 }, logoutModalActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 24 }, cancelLogoutButton: { alignItems: 'center', borderColor: '#9AAEA2', borderRadius: 7, borderWidth: 1, justifyContent: 'center', minHeight: 42, paddingHorizontal: 16 }, cancelLogoutText: { color: '#365144', fontSize: 14, fontWeight: '700' }, confirmLogoutButton: { alignItems: 'center', backgroundColor: '#C64032', borderRadius: 7, justifyContent: 'center', minHeight: 42, paddingHorizontal: 18 }, confirmLogoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
