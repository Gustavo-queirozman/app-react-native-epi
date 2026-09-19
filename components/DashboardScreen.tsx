import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SelectField } from './ui';
import type { ScreenName } from './AppHeader';

type MetricCardProps = { label: string; value: string; detail: string; accent: string; icon: string; onPress?: () => void };
type AlertTone = 'danger' | 'warning' | 'info';

const monthlyConsumption = [42, 57, 48, 66, 58, 75, 84, 72, 91, 82, 96, 88];
const monthlyLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const epiRanking = [
  { name: 'Luva de proteção', amount: 126, color: '#0F5C37' },
  { name: 'Óculos de segurança', amount: 98, color: '#238A57' },
  { name: 'Capacete', amount: 74, color: '#E5B940' },
  { name: 'Protetor auricular', amount: 56, color: '#69AE89' },
];
const alerts: { title: string; description: string; tone: AlertTone; count: string }[] = [
  { title: 'Estoque crítico', description: 'Luva de proteção atingiu o estoque mínimo.', tone: 'danger', count: '01' },
  { title: 'Trocas próximas', description: '3 trocas previstas para os próximos 7 dias.', tone: 'warning', count: '03' },
  { title: 'CA vencendo', description: '2 certificados vencem nos próximos 30 dias.', tone: 'info', count: '02' },
];
const periodOptions = ['Setembro de 2026', 'Últimos 30 dias', 'Últimos 90 dias', 'Ano de 2026'] as const;
type Period = (typeof periodOptions)[number];

export function DashboardScreen({ onNavigate }: { onNavigate: (screen: ScreenName) => void }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 780;
  const isNarrow = width < 470;
  const [period, setPeriod] = useState<Period>(periodOptions[0]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const generateReport = async () => {
    setIsGeneratingPdf(true);
    const html = reportHtml(period);
    try {
      if (Platform.OS === 'web') {
        openWebReport(html);
        return;
      }

      const { uri } = await Print.printToFileAsync(nativePdfOptions(html));
      if (!uri) {
        throw new Error('O arquivo PDF não foi criado.');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Salvar ou compartilhar relatório de gestão de EPIs' });
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.warn('Falha ao criar o PDF do painel:', error);
      try {
        // O diálogo nativo é uma alternativa confiável: no Android, escolha "Salvar como PDF".
        await Print.printAsync({ html });
      } catch (printError) {
        console.warn('Falha ao abrir a impressão do painel:', printError);
        Alert.alert('Não foi possível abrir o relatório', 'Tente novamente em alguns instantes.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return <ScrollView contentContainerStyle={[styles.content, isCompact && styles.compactContent]}>
    <View style={[styles.hero, isNarrow && styles.heroNarrow]}>
      <View style={styles.heroText}><Text style={styles.eyebrow}>VISÃO GERAL</Text><Text style={styles.title}>Painel de gestão</Text><Text style={styles.subtitle}>Acompanhe a segurança, a conformidade e o uso dos EPIs em um só lugar.</Text></View>
      <View style={[styles.panelActions, isNarrow && styles.panelActionsNarrow]}><SelectField label="Filtrar período" value={period} options={periodOptions} onValueChange={setPeriod} containerStyle={styles.periodFilter} /><Pressable accessibilityRole="button" accessibilityLabel="Gerar relatório em PDF" accessibilityState={{ disabled: isGeneratingPdf }} disabled={isGeneratingPdf} onPress={generateReport} style={[styles.pdfButton, isGeneratingPdf && styles.pdfButtonDisabled]}><Text style={styles.pdfButtonIcon}>⇩</Text><Text style={styles.pdfButtonText}>{isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}</Text></Pressable></View>
    </View>

    <View style={styles.metricsGrid}>
      <MetricCard label="Trabalhadores ativos" value="128" detail="4 novos este mês" accent="#0F5C37" icon="◉" onPress={() => onNavigate('Trabalhadores')} />
      <MetricCard label="EPIs sincronizados" value="24" detail="22 com CA válido • base oficial" accent="#238A57" icon="▣" />
      <MetricCard label="Itens em estoque" value="1.248" detail="Cobertura média: 46 dias" accent="#3566A8" icon="▤" onPress={() => onNavigate('Estoque')} />
      <MetricCard label="Entregas no mês" value="86" detail="+12% em relação a agosto" accent="#A56B17" icon="↗" onPress={() => onNavigate('Entrega')} />
      <MetricCard label="Alertas pendentes" value="6" detail="1 requer atenção imediata" accent="#B63A32" icon="!" onPress={() => onNavigate('Alertas')} />
      <MetricCard label="Conformidade geral" value="94,5%" detail="Meta mensal: 95%" accent="#087A73" icon="✓" onPress={() => onNavigate('Trabalhadores')} />
    </View>

    <View style={[styles.primaryRow, isCompact && styles.primaryColumn]}>
      <View style={[styles.card, styles.consumptionCard, isCompact && styles.fullWidth]}>
        <ChartHeader title="Consumo mensal de EPIs" subtitle="Quantidade distribuída em 2026" />
        <View style={styles.chartArea}>
          <View style={styles.axis}><Text style={styles.axisLabel}>100</Text><Text style={styles.axisLabel}>75</Text><Text style={styles.axisLabel}>50</Text><Text style={styles.axisLabel}>25</Text><Text style={styles.axisLabel}>0</Text></View>
          <View style={styles.bars}>{monthlyConsumption.map((value, index) => <View key={monthlyLabels[index]} style={styles.barColumn}><View style={styles.barTrack}><View style={[styles.bar, { height: `${value}%` }]} /></View><Text style={styles.barLabel}>{monthlyLabels[index]}</Text></View>)}</View>
        </View>
        <View style={styles.chartFooter}><View style={styles.legend}><View style={styles.legendDot} /><Text style={styles.legendText}>EPIs distribuídos</Text></View><Text style={styles.chartTotal}>88 entregas no mês</Text></View>
      </View>

      <View style={[styles.card, styles.complianceCard, isCompact && styles.fullWidth]}>
        <ChartHeader title="Conformidade NR-06" subtitle="Situação dos trabalhadores ativos" />
        <View style={styles.complianceBody}><View style={styles.scoreRing}><Text style={styles.scoreValue}>94,5%</Text><Text style={styles.scoreLabel}>conforme</Text></View><View style={styles.complianceLegend}><LegendItem color="#0F5C37" label="100% atendidos" value="121" /><LegendItem color="#E5B940" label="Com pendências" value="7" /><LegendItem color="#DDE7E0" label="Total ativo" value="128" /></View></View>
        <View style={styles.progress}><View style={styles.progressSafe} /><View style={styles.progressWarning} /></View>
        <Text style={styles.note}>7 trabalhadores precisam de ao menos um EPI obrigatório.</Text>
      </View>
    </View>

    <View style={[styles.secondaryRow, isCompact && styles.primaryColumn]}>
      <View style={[styles.card, styles.rankingCard, isCompact && styles.fullWidth]}><ChartHeader title="EPIs mais entregues" subtitle="Ranking do mês" />{epiRanking.map((item) => <View key={item.name} style={styles.rankRow}><Text style={styles.rankName}>{item.name}</Text><View style={styles.rankTrack}><View style={[styles.rankBar, { backgroundColor: item.color, width: `${(item.amount / 126) * 100}%` }]} /></View><Text style={styles.rankValue}>{item.amount}</Text></View>)}<Text style={styles.cardCaption}>Dados contabilizados até 16 de setembro.</Text></View>
      <View style={[styles.card, styles.stockCard, isCompact && styles.fullWidth]}><ChartHeader title="Situação do estoque" subtitle="Disponibilidade por nível" /><View style={styles.stockBars}><StockSegment value="78%" label="Saudável" count="18 itens" color="#0F5C37" /><StockSegment value="14%" label="Atenção" count="3 itens" color="#E5B940" /><StockSegment value="8%" label="Crítico" count="3 itens" color="#C64032" /></View><View style={styles.stockSummary}><Text style={styles.stockSummaryValue}>1.248</Text><Text style={styles.stockSummaryLabel}>unidades disponíveis</Text></View><Text style={styles.cardCaption}>1 item está zerado e precisa de reposição.</Text></View>
    </View>

    <View style={styles.alertSection}><View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Alertas em tempo real</Text><Text style={styles.sectionSubtitle}>Prioridades para a operação de hoje</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Ver todos os alertas" onPress={() => onNavigate('Alertas')} style={styles.alertCount}><Text style={styles.alertCountText}>6 pendentes</Text></Pressable></View><View style={[styles.alertGrid, isNarrow && styles.alertColumn]}>{alerts.map((alert) => <AlertCard key={alert.title} {...alert} onPress={() => onNavigate('Alertas')} />)}</View></View>
  </ScrollView>;
}

function MetricCard({ label, value, detail, accent, icon, onPress }: MetricCardProps) {
  const content = <><View style={[styles.metricIcon, { backgroundColor: accent }]}><Text style={styles.metricIconText}>{icon}</Text></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text>{onPress && <Text style={styles.metricLink}>Ver detalhes ›</Text>}</>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${label}`} onPress={onPress} style={({ pressed }) => [styles.metricCard, pressed && styles.pressableCard]}>{content}</Pressable> : <View style={styles.metricCard}>{content}</View>;
}
function ChartHeader({ title, subtitle }: { title: string; subtitle: string }) { return <View style={styles.chartHeader}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardSubtitle}>{subtitle}</Text></View>; }
function LegendItem({ color, label, value }: { color: string; label: string; value: string }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendItemLabel}>{label}</Text><Text style={styles.legendItemValue}>{value}</Text></View>; }
function StockSegment({ value, label, count, color }: { value: string; label: string; count: string; color: string }) { return <View style={styles.stockSegment}><Text style={[styles.stockPercent, { color }]}>{value}</Text><Text style={styles.stockLabel}>{label}</Text><Text style={styles.stockCount}>{count}</Text></View>; }
function AlertCard({ title, description, tone, count, onPress }: { title: string; description: string; tone: AlertTone; count: string; onPress: () => void }) {
  const tones = { danger: [styles.alert_danger, styles.alertNumber_danger], warning: [styles.alert_warning, styles.alertNumber_warning], info: [styles.alert_info, styles.alertNumber_info] } as const;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver alerta: ${title}`} onPress={onPress} style={({ pressed }) => [styles.alertCard, tones[tone][0], pressed && styles.pressableCard]}><Text style={[styles.alertNumber, tones[tone][1]]}>{count}</Text><View style={styles.alertCopy}><Text style={styles.alertTitle}>{title}</Text><Text style={styles.alertDescription}>{description}</Text></View><Text style={styles.alertArrow}>›</Text></Pressable>;
}

function openWebReport(html: string) {
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    Alert.alert('Não foi possível abrir a impressão', 'Permita pop-ups neste navegador e tente novamente.');
    return;
  }
  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  window.setTimeout(() => reportWindow.print(), 250);
}

function nativePdfOptions(html: string): Print.FilePrintOptions {
  const page = { html, width: 595, height: 842 };

  if (Platform.OS === 'ios') {
    return { ...page, margins: { top: 0, right: 0, bottom: 0, left: 0 } };
  }

  return { ...page, textZoom: 100 };
}

function reportHtml(period: Period) {
  const generatedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const rankings = epiRanking.map((item, index) => `<tr><td><span class="rank">${index + 1}</span>${item.name}</td><td><div class="bar-track"><div class="bar" style="width:${(item.amount / 126) * 100}%"></div></div></td><td class="number">${item.amount}</td></tr>`).join('');
  const alertItems = alerts.map((alert) => `<div class="alert alert-${alert.tone}"><div class="alert-number">${alert.count}</div><div><strong>${alert.title}</strong><span>${alert.description}</span></div></div>`).join('');

  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <style>
        @page { margin: 0; size: A4; }
        * { box-sizing: border-box; }
        body { color: #1d382b; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin: 0; }
        .page { min-height: 297mm; padding: 0 12mm 12mm; position: relative; width: 210mm; }
        .top-rule { background: #e5b940; height: 8px; margin: 0 -42px 28px; }
        .header { align-items: flex-start; border-bottom: 1px solid #dce7df; display: flex; justify-content: space-between; padding-bottom: 22px; }
        .brand { align-items: center; display: flex; gap: 10px; }
        .brand-mark { align-items: center; background: #0f5c37; border-radius: 7px; color: #e5b940; display: flex; font-size: 21px; font-weight: bold; height: 35px; justify-content: center; width: 35px; }
        .brand-name { color: #0f5c37; font-size: 16px; font-weight: bold; }
        .report-type { color: #789082; font-size: 9px; letter-spacing: 1.1px; margin-top: 2px; }
        h1 { color: #123f2a; font-size: 25px; letter-spacing: -.5px; margin: 24px 0 5px; }
        .subtitle { color: #63786a; font-size: 12px; margin: 0; }
        .period { background: #eff6f1; border-left: 3px solid #238a57; color: #175636; font-size: 10px; font-weight: bold; margin-top: 8px; padding: 7px 10px; }
        .period small { color: #6d8376; display: block; font-size: 8px; font-weight: bold; letter-spacing: .7px; margin-bottom: 2px; }
        .section-title { color: #0f5c37; font-size: 14px; font-weight: bold; margin: 24px 0 4px; }
        .section-caption { color: #74877c; margin: 0 0 12px; }
        .kpis { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
        .kpi { border: 1px solid #d9e5de; border-radius: 8px; min-height: 72px; padding: 10px; }
        .kpi-label { color: #687e70; font-size: 9px; }
        .kpi-value { color: #143e2a; font-size: 21px; font-weight: bold; margin-top: 9px; }
        .kpi-alert .kpi-value { color: #b23830; }
        .conformity { background: #f2f8f4; border: 1px solid #d7e7dc; border-radius: 9px; display: flex; gap: 20px; margin-top: 18px; padding: 14px; }
        .conformity-value { color: #0f5c37; font-size: 28px; font-weight: bold; min-width: 87px; }
        .conformity-value span { color: #62796b; display: block; font-size: 9px; font-weight: normal; margin-top: 2px; }
        .conformity-content { flex: 1; }
        .conformity-content strong { color: #1d4731; display: block; margin-bottom: 7px; }
        .progress { background: #dce8e0; border-radius: 5px; height: 8px; overflow: hidden; }
        .progress div { background: #238a57; height: 100%; width: 94.5%; }
        .progress-note { color: #6c8274; font-size: 9px; margin-top: 6px; }
        .split { display: grid; gap: 18px; grid-template-columns: 1.1fr .9fr; margin-top: 8px; }
        table { border-collapse: separate; border-spacing: 0; overflow: hidden; width: 100%; }
        th { background: #0f5c37; color: #fff; font-size: 9px; letter-spacing: .3px; padding: 9px; text-align: left; }
        th:first-child { border-radius: 6px 0 0 0; } th:last-child { border-radius: 0 6px 0 0; }
        td { border-bottom: 1px solid #e2ebe5; color: #355343; padding: 9px; }
        tr:nth-child(even) td { background: #f7faf8; }
        .rank { color: #0f5c37; display: inline-block; font-weight: bold; width: 20px; }
        .number { color: #143e2a; font-weight: bold; text-align: right; width: 42px; }
        .bar-track { background: #e7f0ea; border-radius: 4px; height: 7px; overflow: hidden; width: 100%; }
        .bar { background: #238a57; border-radius: 4px; height: 100%; }
        .stock { border: 1px solid #d9e5de; border-radius: 8px; padding: 15px; }
        .stock-total { color: #0f5c37; font-size: 26px; font-weight: bold; }
        .stock-total span { color: #6d8376; font-size: 9px; font-weight: normal; }
        .stock-row { border-top: 1px solid #e5ede8; display: flex; justify-content: space-between; margin-top: 11px; padding-top: 11px; }
        .stock-row strong { font-size: 13px; } .healthy { color: #0f5c37; } .attention { color: #a16b13; } .critical { color: #b23830; }
        .alert { align-items: center; border-radius: 7px; display: flex; gap: 9px; margin-bottom: 7px; padding: 9px; }
        .alert-number { border-radius: 50%; font-size: 11px; font-weight: bold; padding: 7px; text-align: center; width: 30px; }
        .alert strong { color: #294936; display: block; font-size: 10px; } .alert span { color: #647a6c; display: block; font-size: 9px; margin-top: 2px; }
        .alert-danger { background: #fff4f2; } .alert-danger .alert-number { background: #fce0dc; color: #b23830; }
        .alert-warning { background: #fff9e9; } .alert-warning .alert-number { background: #f9e8b7; color: #8b620b; }
        .alert-info { background: #f0f7f7; } .alert-info .alert-number { background: #d6ece9; color: #087a73; }
        .footer { bottom: 20px; color: #7b8f82; font-size: 8px; left: 42px; position: absolute; right: 42px; }
        .footer-line { background: #dce7df; height: 1px; margin-bottom: 8px; }.footer-content { display: flex; justify-content: space-between; }
        @media screen and (max-width: 720px) { .page { min-height: 100vh; padding: 0 18px 58px; width: 100%; } .top-rule { margin: 0 -18px 20px; } .header, .split { display: block; } .period { display: inline-block; margin-top: 16px; } .kpis { grid-template-columns: repeat(2, 1fr); } .split > div + div { margin-top: 24px; } .footer { bottom: 16px; left: 18px; right: 18px; } }
        @media print { body { background: #fff; } .page { break-after: avoid; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="top-rule"></div>
        <div class="header"><div><div class="brand"><div class="brand-mark">E</div><div><div class="brand-name">Gestão EPI</div><div class="report-type">GESTÃO DE SEGURANÇA</div></div></div><h1>Relatório executivo</h1><p class="subtitle">Indicadores consolidados de estoque, entregas e conformidade NR-06.</p></div><div class="period"><small>PERÍODO ANALISADO</small>${period}</div></div>
        <div class="section-title">Indicadores principais</div><p class="section-caption">Visão resumida da operação no período selecionado.</p>
        <div class="kpis"><div class="kpi"><div class="kpi-label">TRABALHADORES ATIVOS</div><div class="kpi-value">128</div></div><div class="kpi"><div class="kpi-label">EPIs CADASTRADOS</div><div class="kpi-value">24</div></div><div class="kpi"><div class="kpi-label">ITENS EM ESTOQUE</div><div class="kpi-value">1.248</div></div><div class="kpi"><div class="kpi-label">ENTREGAS NO PERÍODO</div><div class="kpi-value">86</div></div><div class="kpi"><div class="kpi-label">CONFORMIDADE GERAL</div><div class="kpi-value">94,5%</div></div><div class="kpi kpi-alert"><div class="kpi-label">ALERTAS PENDENTES</div><div class="kpi-value">6</div></div></div>
        <div class="conformity"><div class="conformity-value">94,5%<span>de conformidade</span></div><div class="conformity-content"><strong>Conformidade NR-06</strong><div class="progress"><div></div></div><div class="progress-note">121 trabalhadores 100% atendidos e 7 com pendências de EPIs obrigatórios.</div></div></div>
        <div class="split"><div><div class="section-title">Ranking de entregas</div><p class="section-caption">EPIs mais distribuídos.</p><table><thead><tr><th>EPI</th><th>Volume relativo</th><th>Qtd.</th></tr></thead><tbody>${rankings}</tbody></table></div><div><div class="section-title">Estoque e alertas</div><p class="section-caption">Pontos de atenção da operação.</p><div class="stock"><div class="stock-total">1.248 <span>unidades disponíveis</span></div><div class="stock-row"><div><strong class="healthy">78%</strong><br /><small>Saudável - 18 itens</small></div><div><strong class="attention">14%</strong><br /><small>Atenção - 3 itens</small></div><div><strong class="critical">8%</strong><br /><small>Crítico - 3 itens</small></div></div></div><div style="margin-top:10px;">${alertItems}</div></div></div>
        <div class="footer"><div class="footer-line"></div><div class="footer-content"><span>Gestão EPI Pro - uso interno</span><span>Gerado em ${generatedAt}</span></div></div>
      </div>
    </body>
  </html>`;
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', maxWidth: 1272, padding: 20, width: '100%' }, compactContent: { padding: 12 },
  hero: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }, heroNarrow: { alignItems: 'flex-start', flexDirection: 'column', gap: 14 }, heroText: { flexShrink: 1 }, eyebrow: { color: '#238A57', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 }, title: { color: '#123F2A', fontSize: 28, fontWeight: '800', letterSpacing: -0.6 }, subtitle: { color: '#64766D', fontSize: 14, lineHeight: 20, marginTop: 5 }, panelActions: { alignItems: 'flex-end', flexDirection: 'row', flexShrink: 1, gap: 9 }, panelActionsNarrow: { alignItems: 'stretch', flexDirection: 'column', width: '100%' }, periodFilter: { flexBasis: 186, flexGrow: 0, width: 186 }, pdfButton: { alignItems: 'center', backgroundColor: '#0F5C37', borderRadius: 8, flexDirection: 'row', gap: 7, height: 43, justifyContent: 'center', paddingHorizontal: 14 }, pdfButtonDisabled: { backgroundColor: '#7F9B8C' }, pdfButtonIcon: { color: '#E5B940', fontSize: 18, fontWeight: '800' }, pdfButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }, metricCard: { backgroundColor: '#FFFFFF', borderColor: '#D9E5DE', borderRadius: 13, borderWidth: 1, flexBasis: 185, flexGrow: 1, minHeight: 152, overflow: 'hidden', padding: 16 }, pressableCard: { opacity: 0.78 }, metricIcon: { alignItems: 'center', borderRadius: 8, height: 28, justifyContent: 'center', position: 'absolute', right: 14, top: 14, width: 28 }, metricIconText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, metricLabel: { color: '#607269', fontSize: 12, fontWeight: '600', maxWidth: '75%' }, metricValue: { color: '#143D2B', fontSize: 27, fontWeight: '800', letterSpacing: -.8, marginTop: 17 }, metricDetail: { color: '#74847C', fontSize: 11, marginTop: 8 }, metricLink: { color: '#0F5C37', fontSize: 11, fontWeight: '800', marginTop: 8 },
  primaryRow: { flexDirection: 'row', gap: 14 }, primaryColumn: { flexDirection: 'column' }, card: { backgroundColor: '#FFFFFF', borderColor: '#D9E5DE', borderRadius: 13, borderWidth: 1, padding: 18 }, fullWidth: { alignSelf: 'stretch', width: '100%' }, consumptionCard: { flex: 1.35, minWidth: 0 }, complianceCard: { flex: 1, minWidth: 0 }, chartHeader: { marginBottom: 18 }, cardTitle: { color: '#173F2D', fontSize: 16, fontWeight: '800' }, cardSubtitle: { color: '#74847C', fontSize: 12, marginTop: 4 },
  chartArea: { flexDirection: 'row', height: 182 }, axis: { height: 154, justifyContent: 'space-between', paddingBottom: 1, width: 25 }, axisLabel: { color: '#91A198', fontSize: 9 }, bars: { borderBottomColor: '#DDE7E1', borderBottomWidth: 1, flex: 1, flexDirection: 'row', gap: 5, height: 155, justifyContent: 'space-between' }, barColumn: { alignItems: 'center', flex: 1, height: 180, justifyContent: 'flex-end', minWidth: 0 }, barTrack: { backgroundColor: '#EEF4F0', borderRadius: 4, height: 154, justifyContent: 'flex-end', overflow: 'hidden', width: '100%' }, bar: { backgroundColor: '#238A57', borderRadius: 4, minHeight: 4, width: '100%' }, barLabel: { color: '#74847C', fontSize: 9, marginTop: 7 }, chartFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, legend: { alignItems: 'center', flexDirection: 'row', gap: 6 }, legendDot: { backgroundColor: '#238A57', borderRadius: 5, height: 8, width: 8 }, legendText: { color: '#607269', fontSize: 11 }, chartTotal: { color: '#0F5C37', fontSize: 11, fontWeight: '700' },
  complianceBody: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', minHeight: 163 }, scoreRing: { alignItems: 'center', borderColor: '#238A57', borderRadius: 75, borderWidth: 10, height: 132, justifyContent: 'center', width: 132 }, scoreValue: { color: '#123F2A', fontSize: 24, fontWeight: '800' }, scoreLabel: { color: '#74847C', fontSize: 11, marginTop: 2 }, complianceLegend: { gap: 13, marginLeft: 12 }, legendItem: { alignItems: 'center', flexDirection: 'row', gap: 7 }, legendItemLabel: { color: '#5C7165', fontSize: 11, minWidth: 94 }, legendItemValue: { color: '#183E2D', fontSize: 12, fontWeight: '800' }, progress: { backgroundColor: '#DDE7E0', borderRadius: 5, flexDirection: 'row', height: 7, marginTop: 14, overflow: 'hidden' }, progressSafe: { backgroundColor: '#0F5C37', width: '94.5%' }, progressWarning: { backgroundColor: '#E5B940', flex: 1 }, note: { color: '#74847C', fontSize: 11, lineHeight: 16, marginTop: 9 },
  secondaryRow: { flexDirection: 'row', gap: 14, marginTop: 14 }, rankingCard: { flex: 1.15, minWidth: 0 }, stockCard: { flex: .85, minWidth: 0 }, rankRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 13 }, rankName: { color: '#41584B', fontSize: 11, width: 113 }, rankTrack: { backgroundColor: '#EDF3EF', borderRadius: 4, flex: 1, height: 9, overflow: 'hidden' }, rankBar: { borderRadius: 4, height: '100%' }, rankValue: { color: '#153F2C', fontSize: 11, fontWeight: '800', textAlign: 'right', width: 25 }, cardCaption: { color: '#77877E', fontSize: 10, marginTop: 3 }, stockBars: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginBottom: 19 }, stockSegment: { alignItems: 'center', flex: 1 }, stockPercent: { fontSize: 19, fontWeight: '800' }, stockLabel: { color: '#53695C', fontSize: 11, fontWeight: '700', marginTop: 3 }, stockCount: { color: '#829187', fontSize: 10, marginTop: 2 }, stockSummary: { alignItems: 'baseline', backgroundColor: '#EFF6F1', borderRadius: 8, flexDirection: 'row', gap: 7, justifyContent: 'center', padding: 11 }, stockSummaryValue: { color: '#0F5C37', fontSize: 23, fontWeight: '800' }, stockSummaryLabel: { color: '#5E7466', fontSize: 11 },
  alertSection: { backgroundColor: '#FFFFFF', borderColor: '#D9E5DE', borderRadius: 13, borderWidth: 1, marginTop: 14, padding: 18 }, sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }, sectionTitle: { color: '#173F2D', fontSize: 16, fontWeight: '800' }, sectionSubtitle: { color: '#74847C', fontSize: 12, marginTop: 3 }, alertCount: { backgroundColor: '#FFF0EE', borderRadius: 14, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 }, alertCountText: { color: '#B23830', fontSize: 11, fontWeight: '800' }, alertGrid: { flexDirection: 'row', gap: 10 }, alertColumn: { flexDirection: 'column' }, alertCard: { alignItems: 'center', borderRadius: 9, borderWidth: 1, flex: 1, flexDirection: 'row', minWidth: 0, padding: 12 }, alert_danger: { backgroundColor: '#FFF4F2', borderColor: '#F2D2CD' }, alert_warning: { backgroundColor: '#FFF9E9', borderColor: '#F3E0A4' }, alert_info: { backgroundColor: '#F0F7F7', borderColor: '#CFE6E3' }, alertNumber: { alignItems: 'center', borderRadius: 20, fontSize: 15, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6 }, alertNumber_danger: { backgroundColor: '#FCE0DC', color: '#B23830' }, alertNumber_warning: { backgroundColor: '#F9E8B7', color: '#8B620B' }, alertNumber_info: { backgroundColor: '#D6ECE9', color: '#087A73' }, alertCopy: { flex: 1, marginLeft: 9, minWidth: 0 }, alertTitle: { color: '#244634', fontSize: 12, fontWeight: '800' }, alertDescription: { color: '#65796C', fontSize: 10, lineHeight: 14, marginTop: 3 }, alertArrow: { color: '#829187', fontSize: 25, lineHeight: 25, marginLeft: 4 },
});
