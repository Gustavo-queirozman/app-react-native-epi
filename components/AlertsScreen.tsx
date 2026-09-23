import { ScrollView, StyleSheet, Text } from 'react-native';
import { PageCard } from './ui';

export function AlertsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PageCard style={styles.card}>
        <Text style={styles.title}>Alertas de troca e estoque</Text>
        <Text style={styles.description}>
          São exibidas trocas vencidas, trocas previstas para os próximos 7 dias, EPIs obrigatórios ainda não entregues, estoque baixo e validade do CA.
        </Text>
        <Text style={styles.emptyState}>Nenhum alerta no momento.</Text>
      </PageCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', flexGrow: 1, padding: 16, width: '100%' },
  card: { minHeight: 149, padding: 16 },
  title: { color: '#12355B', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  description: { color: '#536B83', fontSize: 12, lineHeight: 18 },
  emptyState: { color: '#162B45', fontSize: 16, marginTop: 16 },
});
