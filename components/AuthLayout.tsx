import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export function AuthLayout({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const heroContent = <>
    <View style={styles.logo}><Image accessibilityLabel="Handsafe" resizeMode="contain" source={require('../assets/handsafe-logo.png')} style={styles.logoImage} /></View>
    <Text style={styles.tagline}>Segurança que acompanha seu time.</Text>
    <View style={styles.heroLine} />
  </>;

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
    <ScrollView bounces={false} contentContainerStyle={[styles.content, isWide ? styles.wideContent : styles.compactContent]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, isWide ? styles.wideHero : styles.compactHero]}>{heroContent}</View>
      <View style={[styles.panel, isWide ? styles.widePanel : styles.compactPanel]}>
        <View style={styles.handle} />
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export const authStyles = StyleSheet.create({
  fields: { gap: 16, marginTop: 28 },
  label: { color: '#12355B', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#F8FBFF', borderColor: '#D1E1F2', borderRadius: 12, borderWidth: 1, color: '#162B45', fontSize: 16, height: 52, paddingHorizontal: 15 },
  inputRow: { alignItems: 'center', backgroundColor: '#F8FBFF', borderColor: '#D1E1F2', borderRadius: 12, borderWidth: 1, flexDirection: 'row', height: 52, paddingLeft: 15 },
  inputWithButton: { color: '#162B45', flex: 1, fontSize: 16, height: '100%' },
  iconButton: { alignItems: 'center', height: '100%', justifyContent: 'center', paddingHorizontal: 15 },
  icon: { color: '#365879', fontSize: 19 },
  primaryButton: { alignItems: 'center', backgroundColor: '#1677D2', borderRadius: 12, height: 54, justifyContent: 'center', marginTop: 24 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  helperText: { color: '#536B83', fontSize: 13, lineHeight: 19, marginTop: 20, textAlign: 'center' },
  secondaryButton: { alignItems: 'center', borderColor: '#C9DDF0', borderRadius: 12, borderWidth: 1, height: 50, justifyContent: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#1677D2', fontSize: 15, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: '#1677D2', fontSize: 14, fontWeight: '700' },
  footerText: { color: '#536B83', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  footerLink: { color: '#1677D2', fontWeight: '800' },
  inlineRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 16 },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  check: { alignItems: 'center', borderColor: '#91A8C1', borderRadius: 5, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 },
  checkSelected: { backgroundColor: '#1677D2', borderColor: '#1677D2' },
  checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  checkLabel: { color: '#536B83', fontSize: 13 },
  formFooter: { marginTop: 24 },
  error: { color: '#B42318', fontSize: 13, marginTop: 10 },
  feedbackBox: { backgroundColor: '#F3F8FD', borderColor: '#D1E1F2', borderRadius: 12, borderWidth: 1, marginTop: 28, padding: 16 },
  feedbackTitle: { color: '#12355B', fontSize: 17, fontWeight: '800' },
  feedbackText: { color: '#536B83', fontSize: 14, lineHeight: 21, marginTop: 7 },
});

const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFFFFF', flex: 1 },
  content: { flexGrow: 1, width: '100%' },
  compactContent: { alignSelf: 'center', maxWidth: 640 },
  // ScrollView's content wrapper can otherwise shrink to the intrinsic width of
  // the form on React Native Web. Keep the desktop layout anchored to the
  // viewport, so the side panel never collapses into a narrow column.
  wideContent: { alignItems: 'stretch', flexDirection: 'row', justifyContent: 'center', minHeight: '100%', minWidth: '100%', width: '100%' },
  hero: { alignItems: 'center', backgroundColor: '#E8F5FD', flex: 0.78, justifyContent: 'center', paddingHorizontal: 32, paddingTop: 24 },
  compactHero: { flex: 0, paddingBottom: 32 },
  wideHero: { flex: 1, minHeight: 640, minWidth: 0, paddingHorizontal: 48, paddingTop: 0 },
  logo: { backgroundColor: '#E8F5FD', borderRadius: 12, height: 72, marginBottom: 16, overflow: 'hidden', paddingHorizontal: 10, width: 216 },
  logoImage: { height: '100%', width: '100%' },
  tagline: { color: '#12355B', fontSize: 15, marginTop: 5 },
  heroLine: { backgroundColor: '#20B98D', height: 3, marginTop: 21, width: 42 },
  heroText: { color: '#536B83', fontSize: 14, lineHeight: 21, marginTop: 17, maxWidth: 260, textAlign: 'center' },
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1.22, paddingHorizontal: 24, paddingTop: 14 },
  compactPanel: { flex: 0, minHeight: 0, paddingBottom: 36 },
  widePanel: { borderBottomLeftRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 0, flex: 0, flexShrink: 0, maxWidth: 560, minHeight: 640, minWidth: 440, paddingHorizontal: 48, paddingTop: 32, width: '46%' },
  handle: { alignSelf: 'center', backgroundColor: '#D5E4F3', borderRadius: 3, height: 5, marginBottom: 21, width: 42 },
  eyebrow: { color: '#20B98D', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: '#12355B', fontSize: 27, fontWeight: '800', letterSpacing: -0.4, marginTop: 7 },
  description: { color: '#536B83', fontSize: 15, lineHeight: 22, marginTop: 7 },
});
