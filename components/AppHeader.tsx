import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';

export const screens = ['Painel', 'Funções e periodicidades', 'Trabalhadores', 'Fornecedores', 'Compras', 'Estoque', 'Entrega', 'Ficha', 'Alertas'] as const;
export type ScreenName = (typeof screens)[number];
type AppHeaderProps = { activeScreen: ScreenName; onChangeScreen: (screen: ScreenName) => void; onOpenProfile: () => void; onLogout: () => void };

const menuTopics: { title: string; items: readonly ScreenName[] }[] = [
  { title: 'Visão geral', items: ['Painel', 'Alertas'] },
  { title: 'Cadastros', items: ['Funções e periodicidades', 'Trabalhadores', 'Fornecedores'] },
  { title: 'Operações', items: ['Estoque', 'Compras', 'Entrega', 'Ficha'] },
];

export function AppHeader({ activeScreen, onChangeScreen, onOpenProfile, onLogout }: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = Platform.OS !== 'web' || width < 960;
  const isNarrow = width < 420;
  const selectScreen = (screen: ScreenName) => {
    onChangeScreen(screen);
    setIsMenuOpen(false);
    setOpenTopic(null);
  };
  const openProfile = () => {
    onOpenProfile();
    setIsMenuOpen(false);
    setOpenTopic(null);
  };
  const logout = () => {
    setIsMenuOpen(false);
    setOpenTopic(null);
    onLogout();
  };
  const toggleTopic = (topic: string) => setOpenTopic((current) => current === topic ? null : topic);

  return <View style={styles.header}>
    <View style={[styles.topRow, isCompact && styles.compactTopRow]}>
      {isCompact && <Pressable accessibilityRole="button" accessibilityLabel="Abrir menu" accessibilityState={{ expanded: isMenuOpen }} onPress={() => setIsMenuOpen(true)} hitSlop={8} style={styles.menuButton}><Text style={styles.menuIcon}>☰</Text></Pressable>}
      <View style={styles.brand}><Image accessibilityLabel="Handsafe" resizeMode="contain" source={require('../assets/handsafe-logo.png')} style={styles.brandLogo} /></View>
      {isCompact
        ? <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={openProfile} style={styles.profileButton}><Text style={styles.profileIcon}>◉</Text>{!isNarrow && <Text style={styles.profileLabel}>Perfil</Text>}</Pressable>
        : <View style={styles.webActions}><Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={openProfile} style={styles.profileButton}><Text style={styles.profileIcon}>◉</Text><Text style={styles.profileLabel}>Perfil</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={logout} style={styles.webLogoutButton}><Text style={styles.webLogoutText}>Sair</Text></Pressable></View>}
    </View>
    {!isCompact && <View style={styles.webMenu}><View style={styles.webMenuContent}>{menuTopics.map((topic) => <TopicMenu key={topic.title} topic={topic} activeScreen={activeScreen} expanded={openTopic === topic.title} onToggle={() => toggleTopic(topic.title)} onSelect={selectScreen} />)}</View></View>}
    {isCompact && <Modal visible={isMenuOpen} transparent animationType="slide" onRequestClose={() => setIsMenuOpen(false)}>
      <View style={styles.drawerOverlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" style={StyleSheet.absoluteFill} onPress={() => setIsMenuOpen(false)} />
        <View accessibilityViewIsModal style={styles.drawer}>
          <View style={styles.drawerHeader}><Text style={styles.drawerTitle}>Menu</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => setIsMenuOpen(false)} hitSlop={8} style={styles.closeButton}><Text style={styles.closeIcon}>×</Text></Pressable></View>
          <ScrollView contentContainerStyle={styles.drawerMenu}>{menuTopics.map((topic) => <TopicMenu key={topic.title} topic={topic} activeScreen={activeScreen} expanded={openTopic === topic.title} variant="drawer" onToggle={() => toggleTopic(topic.title)} onSelect={selectScreen} />)}<View style={styles.drawerActions}><Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={openProfile} style={styles.drawerProfileButton}><Text style={styles.drawerProfileText}>◉  Meu perfil</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={logout} style={styles.drawerLogoutButton}><Text style={styles.drawerLogoutText}>Sair da conta</Text></Pressable></View></ScrollView>
        </View>
      </View>
    </Modal>}
  </View>;
}

function TopicMenu({ topic, activeScreen, expanded, onToggle, onSelect, variant = 'web' }: { topic: { title: string; items: readonly ScreenName[] }; activeScreen: ScreenName; expanded: boolean; onToggle: () => void; onSelect: (screen: ScreenName) => void; variant?: 'web' | 'drawer' }) {
  const isDrawer = variant === 'drawer';
  const containsActive = topic.items.includes(activeScreen);
  return <View style={[isDrawer ? styles.drawerTopic : styles.webTopic, !isDrawer && expanded && styles.webTopicExpanded]}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle} style={[isDrawer ? styles.drawerTopicButton : styles.webTopicButton, containsActive && (isDrawer ? styles.drawerTopicButtonActive : styles.webTopicButtonActive)]}>
      <Text style={[isDrawer ? styles.drawerTopicLabel : styles.webTopicLabel, containsActive && (isDrawer ? styles.drawerTopicLabelActive : styles.webTopicLabelActive)]}>{topic.title}</Text>
      <Text style={[isDrawer ? styles.drawerChevron : styles.webChevron, containsActive && (isDrawer ? styles.drawerTopicLabelActive : styles.webTopicLabelActive)]}>{expanded ? '⌃' : '⌄'}</Text>
    </Pressable>
    {expanded && <View style={isDrawer ? styles.drawerSubmenu : styles.webSubmenu}>{topic.items.map((screen) => <MenuItem key={screen} screen={screen} active={screen === activeScreen} variant={isDrawer ? 'drawer' : 'web'} onPress={() => onSelect(screen)} />)}</View>}
  </View>;
}

function MenuItem({ screen, active, onPress, variant = 'web' }: { screen: ScreenName; active: boolean; onPress: () => void; variant?: 'web' | 'drawer' }) {
  const isDrawer = variant === 'drawer';
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[isDrawer ? styles.drawerMenuItem : styles.webMenuItem, active && (isDrawer ? styles.drawerMenuItemActive : styles.webMenuItemActive)]}><Text style={[isDrawer ? styles.drawerMenuLabel : styles.webMenuLabel, active && (isDrawer ? styles.drawerMenuLabelActive : styles.webMenuLabelActive)]}>{screen}</Text></Pressable>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#E8F5FD', boxShadow: '0px 4px 12px rgba(18, 53, 91, 0.12)', paddingTop: 10, position: 'relative', zIndex: 10 },
  topRow: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1272, paddingBottom: 14, paddingHorizontal: 20, width: '100%' },
  compactTopRow: { paddingHorizontal: 16 },
  brand: { backgroundColor: '#E8F5FD', borderRadius: 7, flexShrink: 1, height: 35, overflow: 'hidden', paddingHorizontal: 7, width: 132 }, brandLogo: { height: '100%', width: '100%' },
  webActions: { alignItems: 'center', flexDirection: 'row', gap: 12 }, profileButton: { alignItems: 'center', flexDirection: 'row', flexShrink: 0, gap: 5, padding: 5 }, profileIcon: { color: '#1677D2', fontSize: 17 }, profileLabel: { color: '#12355B', fontSize: 14, fontWeight: '600' }, webLogoutButton: { backgroundColor: '#C64032', borderRadius: 7, minHeight: 34, justifyContent: 'center', paddingHorizontal: 14 }, webLogoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  menuButton: { alignItems: 'center', flexShrink: 0, height: 32, justifyContent: 'center', marginRight: 12, width: 28 }, menuIcon: { color: '#12355B', fontSize: 25, lineHeight: 28 },
  webMenu: { borderTopColor: '#C9E3F4', borderTopWidth: 1, position: 'relative', zIndex: 20 }, webMenuContent: { alignSelf: 'center', flexDirection: 'row', gap: 4, maxWidth: 1272, paddingHorizontal: 12, width: '100%' }, webTopic: { position: 'relative', zIndex: 1 }, webTopicExpanded: { zIndex: 30 }, webTopicButton: { alignItems: 'center', borderBottomColor: 'transparent', borderBottomWidth: 3, flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingVertical: 12 }, webTopicButtonActive: { borderBottomColor: '#1677D2' }, webTopicLabel: { color: '#315779', fontSize: 14, fontWeight: '700' }, webTopicLabelActive: { color: '#12355B' }, webChevron: { color: '#315779', fontSize: 16, lineHeight: 16 }, webSubmenu: { backgroundColor: '#FFFFFF', borderColor: '#C9DDF0', borderRadius: 10, borderWidth: 1, boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.18)', left: 0, minWidth: 215, padding: 6, position: 'absolute', top: 48, zIndex: 40 }, webMenuItem: { borderRadius: 6, minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 }, webMenuItemActive: { backgroundColor: '#E8F5FD' }, webMenuLabel: { color: '#365879', fontSize: 14, fontWeight: '600' }, webMenuLabelActive: { color: '#12355B', fontWeight: '800' },
  drawerOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.46)', flex: 1 }, drawer: { backgroundColor: '#E8F5FD', boxShadow: '3px 0px 10px rgba(0, 0, 0, 0.22)', height: '100%', maxWidth: 340, paddingTop: 16, width: '82%' }, drawerHeader: { alignItems: 'center', borderBottomColor: '#C9E3F4', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, paddingHorizontal: 20 }, drawerTitle: { color: '#12355B', fontSize: 21, fontWeight: '700' }, closeButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 }, closeIcon: { color: '#315779', fontSize: 30, fontWeight: '300', lineHeight: 30 }, drawerMenu: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 12 }, drawerTopic: { borderBottomColor: '#C9E3F4', borderBottomWidth: 1, paddingVertical: 3 }, drawerTopicButton: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14 }, drawerTopicButtonActive: { backgroundColor: '#D9EDFA' }, drawerTopicLabel: { color: '#315779', fontSize: 16, fontWeight: '700' }, drawerTopicLabelActive: { color: '#12355B' }, drawerChevron: { color: '#315779', fontSize: 19, lineHeight: 20 }, drawerSubmenu: { paddingBottom: 7, paddingLeft: 12, paddingTop: 3 }, drawerMenuItem: { borderRadius: 8, minHeight: 42, justifyContent: 'center', marginBottom: 2, paddingHorizontal: 14 }, drawerMenuItemActive: { backgroundColor: '#D9EDFA' }, drawerMenuLabel: { color: '#536B83', fontSize: 15, fontWeight: '600' }, drawerMenuLabelActive: { color: '#12355B', fontWeight: '800' }, drawerActions: { borderTopColor: '#C9E3F4', borderTopWidth: 1, gap: 8, marginTop: 12, paddingBottom: 24, paddingTop: 16 }, drawerProfileButton: { borderColor: '#1677D2', borderRadius: 8, borderWidth: 1, minHeight: 46, justifyContent: 'center', paddingHorizontal: 14 }, drawerProfileText: { color: '#12355B', fontSize: 16, fontWeight: '700' }, drawerLogoutButton: { alignItems: 'center', backgroundColor: '#C64032', borderRadius: 8, minHeight: 48, justifyContent: 'center', paddingHorizontal: 14 }, drawerLogoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
