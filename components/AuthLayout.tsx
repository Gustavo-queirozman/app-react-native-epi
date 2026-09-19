import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export function AuthLayout({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const heroContent = <>
    <View style={styles.logo}><Text style={styles.logoText}>E</Text></View>
    <Text style={styles.brand}>Gestão EPI</Text>
    <Text style={styles.tagline}>Segurança que acompanha seu time.</Text>
    <View style={styles.heroLine} />
    <Text style={styles.heroText}>Organize EPIs, entregas e alertas em um só lugar.</Text>
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
  label: { color: '#1D563A', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#F7FAF8', borderColor: '#D4E1D8', borderRadius: 12, borderWidth: 1, color: '#14261B', fontSize: 16, height: 52, paddingHorizontal: 15 },
  inputRow: { alignItems: 'center', backgroundColor: '#F7FAF8', borderColor: '#D4E1D8', borderRadius: 12, borderWidth: 1, flexDirection: 'row', height: 52, paddingLeft: 15 },
  inputWithButton: { color: '#14261B', flex: 1, fontSize: 16, height: '100%' },
  iconButton: { alignItems: 'center', height: '100%', justifyContent: 'center', paddingHorizontal: 15 },
  icon: { color: '#467058', fontSize: 19 },
  primaryButton: { alignItems: 'center', backgroundColor: '#0F5C37', borderRadius: 12, height: 54, justifyContent: 'center', marginTop: 24 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  helperText: { color: '#69786F', fontSize: 13, lineHeight: 19, marginTop: 20, textAlign: 'center' },
  secondaryButton: { alignItems: 'center', borderColor: '#BFD9CB', borderRadius: 12, borderWidth: 1, height: 50, justifyContent: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#0F5C37', fontSize: 15, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: '#0F5C37', fontSize: 14, fontWeight: '700' },
  footerText: { color: '#69786F', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  footerLink: { color: '#0F5C37', fontWeight: '800' },
  inlineRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 16 },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  check: { alignItems: 'center', borderColor: '#9AB3A4', borderRadius: 5, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 },
  checkSelected: { backgroundColor: '#0F5C37', borderColor: '#0F5C37' },
  checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  checkLabel: { color: '#526259', fontSize: 13 },
  formFooter: { marginTop: 24 },
  error: { color: '#B42318', fontSize: 13, marginTop: 10 },
  feedbackBox: { backgroundColor: '#F0F8F3', borderColor: '#C7DECF', borderRadius: 12, borderWidth: 1, marginTop: 28, padding: 16 },
  feedbackTitle: { color: '#1D563A', fontSize: 17, fontWeight: '800' },
  feedbackText: { color: '#526259', fontSize: 14, lineHeight: 21, marginTop: 7 },
});

const styles = StyleSheet.create({
  screen: { backgroundColor: '#0F5C37', flex: 1 },
  content: { flexGrow: 1, width: '100%' },
  compactContent: { alignSelf: 'center', maxWidth: 640 },
  // ScrollView's content wrapper can otherwise shrink to the intrinsic width of
  // the form on React Native Web. Keep the desktop layout anchored to the
  // viewport, so the side panel never collapses into a narrow column.
  wideContent: { alignItems: 'stretch', flexDirection: 'row', justifyContent: 'center', minHeight: '100%', minWidth: '100%', width: '100%' },
  hero: { alignItems: 'center', flex: 0.78, justifyContent: 'center', paddingHorizontal: 32, paddingTop: 24 },
  compactHero: { flex: 0, paddingBottom: 32 },
  wideHero: { flex: 1, minHeight: 640, minWidth: 0, paddingHorizontal: 48, paddingTop: 0 },
  logo: { alignItems: 'center', backgroundColor: '#E5B940', borderRadius: 19, height: 56, justifyContent: 'center', marginBottom: 12, width: 56 },
  logoText: { color: '#0F5C37', fontSize: 33, fontWeight: '900' },
  brand: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  tagline: { color: '#D8E9DF', fontSize: 15, marginTop: 5 },
  heroLine: { backgroundColor: '#E5B940', height: 3, marginTop: 21, width: 42 },
  heroText: { color: '#D8E9DF', fontSize: 14, lineHeight: 21, marginTop: 17, maxWidth: 260, textAlign: 'center' },
  panel: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1.22, paddingHorizontal: 24, paddingTop: 14 },
  compactPanel: { flex: 0, minHeight: 0, paddingBottom: 36 },
  widePanel: { borderBottomLeftRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 0, flex: 0, flexShrink: 0, maxWidth: 560, minHeight: 640, minWidth: 440, paddingHorizontal: 48, paddingTop: 32, width: '46%' },
  handle: { alignSelf: 'center', backgroundColor: '#D9E5DD', borderRadius: 3, height: 5, marginBottom: 21, width: 42 },
  eyebrow: { color: '#B07D0D', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: '#163C28', fontSize: 27, fontWeight: '800', letterSpacing: -0.4, marginTop: 7 },
  description: { color: '#64746A', fontSize: 15, lineHeight: 22, marginTop: 7 },
});
