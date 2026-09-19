import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
      <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View><Text numberOfLines={1} style={styles.brandName}>Gestão EPI</Text></View>
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
  header: { backgroundColor: '#0F5C37', elevation: 10, paddingTop: 10, position: 'relative', zIndex: 10 },
  topRow: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1272, paddingBottom: 14, paddingHorizontal: 20, width: '100%' },
  compactTopRow: { paddingHorizontal: 16 },
  brand: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 9 }, brandMark: { alignItems: 'center', backgroundColor: '#E5B940', borderRadius: 8, height: 31, justifyContent: 'center', width: 31 }, brandMarkText: { color: '#0F5C37', fontSize: 19, fontWeight: '800' }, brandName: { color: '#FFFFFF', flexShrink: 1, fontSize: 19, fontWeight: '700' },
  webActions: { alignItems: 'center', flexDirection: 'row', gap: 12 }, profileButton: { alignItems: 'center', flexDirection: 'row', flexShrink: 0, gap: 5, padding: 5 }, profileIcon: { color: '#E5B940', fontSize: 17 }, profileLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }, webLogoutButton: { backgroundColor: '#C64032', borderRadius: 7, minHeight: 34, justifyContent: 'center', paddingHorizontal: 14 }, webLogoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  menuButton: { alignItems: 'center', flexShrink: 0, height: 32, justifyContent: 'center', marginRight: 12, width: 28 }, menuIcon: { color: '#FFFFFF', fontSize: 25, lineHeight: 28 },
  webMenu: { borderTopColor: 'rgba(255,255,255,0.12)', borderTopWidth: 1, position: 'relative', zIndex: 20 }, webMenuContent: { alignSelf: 'center', flexDirection: 'row', gap: 4, maxWidth: 1272, paddingHorizontal: 12, width: '100%' }, webTopic: { position: 'relative', zIndex: 1 }, webTopicExpanded: { zIndex: 30 }, webTopicButton: { alignItems: 'center', borderBottomColor: 'transparent', borderBottomWidth: 3, flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingVertical: 12 }, webTopicButtonActive: { borderBottomColor: '#E5B940' }, webTopicLabel: { color: '#D8E9DF', fontSize: 14, fontWeight: '700' }, webTopicLabelActive: { color: '#FFFFFF' }, webChevron: { color: '#D8E9DF', fontSize: 16, lineHeight: 16 }, webSubmenu: { backgroundColor: '#FFFFFF', borderColor: '#C9D9CF', borderRadius: 10, borderWidth: 1, elevation: 8, left: 0, minWidth: 215, padding: 6, position: 'absolute', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, top: 48, zIndex: 40 }, webMenuItem: { borderRadius: 6, minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 }, webMenuItemActive: { backgroundColor: '#E2F1E8' }, webMenuLabel: { color: '#365144', fontSize: 14, fontWeight: '600' }, webMenuLabelActive: { color: '#075A35', fontWeight: '800' },
  drawerOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.46)', flex: 1 }, drawer: { backgroundColor: '#FFFFFF', elevation: 12, height: '100%', maxWidth: 340, paddingTop: 16, shadowColor: '#000000', shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.22, shadowRadius: 10, width: '82%' }, drawerHeader: { alignItems: 'center', borderBottomColor: '#D5E0D9', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, paddingHorizontal: 20 }, drawerTitle: { color: '#064F2E', fontSize: 21, fontWeight: '700' }, closeButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 }, closeIcon: { color: '#365144', fontSize: 30, fontWeight: '300', lineHeight: 30 }, drawerMenu: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 12 }, drawerTopic: { borderBottomColor: '#E3EBE6', borderBottomWidth: 1, paddingVertical: 3 }, drawerTopicButton: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14 }, drawerTopicButtonActive: { backgroundColor: '#E2F1E8' }, drawerTopicLabel: { color: '#365144', fontSize: 16, fontWeight: '700' }, drawerTopicLabelActive: { color: '#075A35' }, drawerChevron: { color: '#365144', fontSize: 19, lineHeight: 20 }, drawerSubmenu: { paddingBottom: 7, paddingLeft: 12, paddingTop: 3 }, drawerMenuItem: { borderRadius: 8, minHeight: 42, justifyContent: 'center', marginBottom: 2, paddingHorizontal: 14 }, drawerMenuItemActive: { backgroundColor: '#D5ECDC' }, drawerMenuLabel: { color: '#53645B', fontSize: 15, fontWeight: '600' }, drawerMenuLabelActive: { color: '#075A35', fontWeight: '800' }, drawerActions: { borderTopColor: '#D5E0D9', borderTopWidth: 1, gap: 8, marginTop: 12, paddingBottom: 24, paddingTop: 16 }, drawerProfileButton: { borderColor: '#0F5C37', borderRadius: 8, borderWidth: 1, minHeight: 46, justifyContent: 'center', paddingHorizontal: 14 }, drawerProfileText: { color: '#075A35', fontSize: 16, fontWeight: '700' }, drawerLogoutButton: { alignItems: 'center', backgroundColor: '#C64032', borderRadius: 8, minHeight: 48, justifyContent: 'center', paddingHorizontal: 14 }, drawerLogoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
