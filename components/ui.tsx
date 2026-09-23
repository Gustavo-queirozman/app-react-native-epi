import { useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

export function PageCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }
type FormFieldProps = TextInputProps & { label: string; containerStyle?: StyleProp<ViewStyle> };
export function FormField({ label, containerStyle, ...inputProps }: FormFieldProps) { return <View style={[styles.field, containerStyle]}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#7489A0" style={styles.input} {...inputProps} /></View>; }
export function SelectField<T extends string>({ label, value, options, onValueChange, containerStyle }: { label: string; value: T; options: readonly T[]; onValueChange: (value: T) => void; containerStyle?: StyleProp<ViewStyle> }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectOption = (option: T) => { onValueChange(option); setIsOpen(false); };

  return <View style={[styles.field, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setIsOpen(true)} style={styles.select}>
      <Text style={styles.selectText}>{value}</Text><Text style={styles.chevron}>⌄</Text>
    </Pressable>
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
      <View style={styles.modalBackdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar opções" style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
        <View accessibilityViewIsModal style={styles.optionPanel}>
          <Text style={styles.optionTitle}>{label}</Text>
          {options.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: option === value }} onPress={() => selectOption(option)} style={[styles.option, option === value && styles.optionSelected]}>
            <Text style={[styles.optionText, option === value && styles.optionTextSelected]}>{option}</Text>
          </Pressable>)}
        </View>
      </View>
    </Modal>
  </View>;
}
export function AppButton({ title, onPress, variant = 'primary' }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' }) { return <Pressable onPress={onPress} style={[styles.button, styles[variant]]}><Text style={styles.buttonText}>{title}</Text></Pressable>; }
const styles = StyleSheet.create({ card: { alignSelf: 'center', backgroundColor: '#FFFFFF', borderColor: '#D5E4F3', borderRadius: 12, borderWidth: 1, maxWidth: 1240, padding: 16, width: '100%' }, field: { flexBasis: 'auto', flexGrow: 1, flexShrink: 1, gap: 7, minWidth: 0 }, label: { color: '#12355B', fontSize: 14, fontWeight: '700' }, input: { backgroundColor: '#FFFFFF', borderColor: '#AABFD4', borderRadius: 7, borderWidth: 1, color: '#162B45', fontSize: 16, height: 43, paddingHorizontal: 12, width: '100%' }, select: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#AABFD4', borderRadius: 7, borderWidth: 1, flexDirection: 'row', height: 43, justifyContent: 'space-between', paddingHorizontal: 12, width: '100%' }, selectText: { color: '#162B45', flexShrink: 1, fontSize: 16 }, chevron: { color: '#365879', fontSize: 22, lineHeight: 22 }, modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.42)', flex: 1, justifyContent: 'center', padding: 24 }, optionPanel: { backgroundColor: '#FFFFFF', borderRadius: 12, maxWidth: 440, padding: 16, width: '100%' }, optionTitle: { color: '#12355B', fontSize: 18, fontWeight: '700', marginBottom: 8 }, option: { borderRadius: 7, minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }, optionSelected: { backgroundColor: '#E4F2FF' }, optionText: { color: '#162B45', fontSize: 16 }, optionTextSelected: { color: '#12355B', fontWeight: '700' }, button: { alignItems: 'center', borderRadius: 7, justifyContent: 'center', minHeight: 42, paddingHorizontal: 15 }, primary: { backgroundColor: '#1677D2' }, secondary: { backgroundColor: '#53708D' }, danger: { backgroundColor: '#C64032', minHeight: 31, paddingHorizontal: 10 }, buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' } });
