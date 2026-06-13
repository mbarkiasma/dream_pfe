import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { AnalysePersonnalite } from '@/payload-types'
import type { ReportWellbeingTheme, ReportWellbeingKey } from '@/utilities/getReportWellbeingTheme'

type ReportWellbeing = {
  key: ReportWellbeingKey
  score: number | null
  theme: ReportWellbeingTheme
  label: string
  description: string
}

type SupportedLocale = 'fr' | 'en'

type AnalysisPdfDocumentProps = {
  analyse: AnalysePersonnalite
  date: string
  reportWellbeing: ReportWellbeing
  locale?: SupportedLocale
}

Font.registerHyphenationCallback((word) => [word])


const mindlyPdfTheme = {
  bg: '#f8f5ff',
  reportCream: '#fff2df',
  reportCreamLight: '#fff8ed',
  surface: '#fffefd',
  primary: '#895ef8',
  primaryLight: '#a987ff',
  primaryMuted: '#7c3aed',
  textStrong: '#1f0a4e',
  textSoft: '#706b99',
  border: '#ebe3fd',
  borderWarm: '#ffc38f',
  shadowSoft: '#efe7f9',
}

const themeColors: Record<
  ReportWellbeingTheme,
  {
    accent: string
    accentSoft: string
    card: string
    pill: string
  }
> = {
  green: {
    accent: '#047857',
    accentSoft: '#a7f3d0',
    card: '#f5fff9',
    pill: '#ecfdf5',
  },
  orange: {
    accent: mindlyPdfTheme.primaryMuted,
    accentSoft: '#ffc38f',
    card: mindlyPdfTheme.reportCream,
    pill: '#fff7ed',
  },
  rose: {
    accent: '#be123c',
    accentSoft: '#fecdd3',
    card: '#fff1f2',
    pill: '#fff1f2',
  },
}

const pdfLabels = {
  fr: {
    kicker: "Rapport d'analyse",
    generatedOn: 'Généré le',
    overview: "Vue d'ensemble",
    conclusion: 'Conclusion',
    noOverview: "Aucune vue d'ensemble disponible.",
    noConclusion: 'Aucune conclusion disponible.',
    balanceIndex: "Indice d'équilibre",
    balanceScore: "Score d'équilibre",
    dominantStrengths: 'Forces dominantes',
    watchPoints: 'Points de vigilance',
    relationalStyle: 'Style relationnel',
    notProvided: 'Non renseigné.',
    notProvidedShort: 'Non renseigné',
    bigFive: 'Traits Big Five',
    score: 'Score',
    observedIndicators: 'Indicateurs observés',
    analysisUnavailable: 'Analyse non disponible.',
    emotionalProfile: 'Profil émotionnel',
    dominantEmotion: 'Émotion dominante',
    emotionalStability: 'Stabilité émotionnelle',
    noEmotionalSummary: 'Aucun résumé émotionnel disponible.',
    recommendations: 'Recommandations',
    noRecommendations: 'Aucune recommandation disponible.',
    wellbeing: {
      pending: {
        label: "Profil en cours d'évaluation",
        description: "Les scores Big Five ne sont pas encore suffisants pour calculer un indice fiable.",
      },
      balanced: {
        label: 'Profil globalement équilibré',
        description: 'Les traits indiquent un bon niveau de ressources personnelles et une stabilité globale encourageante.',
      },
      toSupport: {
        label: 'Profil à accompagner',
        description: 'Le profil montre des forces utiles, avec certains points à soutenir pour améliorer le confort quotidien.',
      },
      sensitive: {
        label: 'Profil sensible',
        description: 'Le profil indique plusieurs zones de fragilité qui méritent un accompagnement attentif et progressif.',
      },
    },
    traits: {
      Ouverture: 'Ouverture',
      Conscienciosite: 'Conscienciosité',
      Extraversion: 'Extraversion',
      Agreabilite: 'Agréabilité',
      Neuroticisme: 'Neuroticisme',
    },
  },
  en: {
    kicker: 'Analysis Report',
    generatedOn: 'Generated on',
    overview: 'Overview',
    conclusion: 'Conclusion',
    noOverview: 'No overview available.',
    noConclusion: 'No conclusion available.',
    balanceIndex: 'Balance Index',
    balanceScore: 'Balance Score',
    dominantStrengths: 'Dominant Strengths',
    watchPoints: 'Key Watch Points',
    relationalStyle: 'Relational Style',
    notProvided: 'Not provided.',
    notProvidedShort: 'Not provided',
    bigFive: 'Big Five Traits',
    score: 'Score',
    observedIndicators: 'Observed Indicators',
    analysisUnavailable: 'Analysis not available.',
    emotionalProfile: 'Emotional Profile',
    dominantEmotion: 'Dominant Emotion',
    emotionalStability: 'Emotional Stability',
    noEmotionalSummary: 'No emotional summary available.',
    recommendations: 'Recommendations',
    noRecommendations: 'No recommendations available.',
    wellbeing: {
      pending: {
        label: 'Profile being evaluated',
        description: 'Big Five scores are not yet sufficient to calculate a reliable index.',
      },
      balanced: {
        label: 'Overall balanced profile',
        description: 'Traits indicate a good level of personal resources and encouraging overall stability.',
      },
      toSupport: {
        label: 'Profile to support',
        description: 'The profile shows useful strengths, with certain areas to support to improve daily comfort.',
      },
      sensitive: {
        label: 'Sensitive profile',
        description: 'The profile indicates several areas of vulnerability that deserve careful and progressive support.',
      },
    },
    traits: {
      Ouverture: 'Openness',
      Conscienciosite: 'Conscientiousness',
      Extraversion: 'Extraversion',
      Agreabilite: 'Agreeableness',
      Neuroticisme: 'Neuroticism',
    },
  },
} as const

const styles = StyleSheet.create({
  page: {
    backgroundColor: mindlyPdfTheme.bg,
    color: mindlyPdfTheme.textStrong,
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 12,
  },
  reportCard: {
    backgroundColor: mindlyPdfTheme.reportCream,
    borderColor: mindlyPdfTheme.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 28,
    position: 'relative',
  },
  warmGlow: {
    backgroundColor: '#ffd29b',
    borderRadius: 180,
    height: 240,
    left: -72,
    opacity: 0.5,
    position: 'absolute',
    top: -82,
    width: 280,
  },
  violetGlow: {
    backgroundColor: '#eee8ff',
    borderRadius: 160,
    height: 220,
    opacity: 0.68,
    position: 'absolute',
    right: -92,
    top: -70,
    width: 260,
  },
  content: {
    position: 'relative',
  },
  header: {
    borderBottomColor: '#e8d9ef',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
    width: 170,
  },
  kicker: {
    color: mindlyPdfTheme.primaryMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  muted: {
    color: mindlyPdfTheme.textSoft,
    fontSize: 11,
  },
  wellbeingPill: {
    backgroundColor: '#fffaf7',
    borderRadius: 999,
    borderWidth: 1,
    color: mindlyPdfTheme.textStrong,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  threeColumns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  column: {
    flex: 1,
  },
  card: {
    backgroundColor: mindlyPdfTheme.surface,
    borderColor: mindlyPdfTheme.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },
  cardTall: {
    minHeight: 118,
  },
  balanceCard: {
    backgroundColor: '#fffaf4',
    borderColor: '#ffcfa7',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    padding: 17,
  },
  sectionTitle: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  miniTitle: {
    color: mindlyPdfTheme.primaryMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  body: {
    color: mindlyPdfTheme.textSoft,
    fontSize: 11,
    lineHeight: 1.75,
  },
  strong: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 11,
    fontWeight: 'bold',
  },
  h2: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  traitCard: {
    backgroundColor: mindlyPdfTheme.surface,
    borderColor: mindlyPdfTheme.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 18,
  },
  traitHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  traitName: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scorePill: {
    backgroundColor: '#fffaf7',
    borderColor: mindlyPdfTheme.borderWarm,
    borderRadius: 999,
    borderWidth: 1,
    color: mindlyPdfTheme.textStrong,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 6,
  },
  bullet: {
    color: mindlyPdfTheme.textStrong,
    fontSize: 12,
    width: 9,
  },
  bulletText: {
    color: mindlyPdfTheme.textStrong,
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.55,
  },
})

export function AnalysisPdfDocument({
  analyse,
  date,
  reportWellbeing,
  locale = 'fr',
}: AnalysisPdfDocumentProps) {
  const theme = themeColors[reportWellbeing.theme]
  const L = pdfLabels[locale]
  const wellbeingText = L.wellbeing[reportWellbeing.key]
  const traitLabel = (name: string) =>
    (L.traits as Record<string, string>)[name] ?? name

  return (
    <Document title={analyse.reference}>
      <Page size="A4" style={styles.page}>
        <View style={[styles.reportCard, { backgroundColor: theme.card }]}>
          <View style={styles.warmGlow} />
          <View style={styles.violetGlow} />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.kicker}>{L.kicker}</Text>
                <Text style={styles.title}>{analyse.reference}</Text>
                <Text style={styles.muted}>{L.generatedOn} {date}</Text>
              </View>

              <View style={styles.headerRight}>
                <Text
                  style={[
                    styles.wellbeingPill,
                    {
                      backgroundColor: theme.pill,
                      borderColor: theme.accentSoft,
                    },
                  ]}
                >
                  {wellbeingText.label}
                  {reportWellbeing.score !== null
                    ? `   ${reportWellbeing.score.toFixed(1)}/10`
                    : ''}
                </Text>
              </View>
            </View>

            <View style={styles.twoColumns}>
              <View style={[styles.card, styles.cardTall, styles.column]}>
                <Text style={styles.sectionTitle}>{L.overview}</Text>
                <Text style={styles.body}>
                  {analyse.overview || L.noOverview}
                </Text>
              </View>

              <View style={[styles.card, styles.cardTall, styles.column]}>
                <Text style={styles.sectionTitle}>{L.conclusion}</Text>
                <Text style={styles.body}>
                  {analyse.conclusion || L.noConclusion}
                </Text>
              </View>
            </View>

            <View style={styles.balanceCard} wrap={false}>
              <Text style={[styles.miniTitle, { color: theme.accent }]}>{L.balanceIndex}</Text>
              <Text style={styles.sectionTitle}>{wellbeingText.label}</Text>
              <Text style={styles.body}>{wellbeingText.description}</Text>
              {reportWellbeing.score !== null ? (
                <Text style={[styles.strong, { marginTop: 10 }]}>
                  {L.balanceScore} : {reportWellbeing.score.toFixed(1)}/10
                </Text>
              ) : null}
            </View>

            <View style={styles.threeColumns}>
              <View style={[styles.card, styles.column]} wrap={false}>
                <Text style={[styles.miniTitle, { color: theme.accent }]}>{L.dominantStrengths}</Text>
                <Text style={styles.body}>{analyse.forcesDominantes || L.notProvided}</Text>
              </View>

              <View style={[styles.card, styles.column]} wrap={false}>
                <Text style={[styles.miniTitle, { color: theme.accent }]}>{L.watchPoints}</Text>
                <Text style={styles.body}>{analyse.pointsVigilance || L.notProvided}</Text>
              </View>

              <View style={[styles.card, styles.column]} wrap={false}>
                <Text style={[styles.miniTitle, { color: theme.accent }]}>{L.relationalStyle}</Text>
                <Text style={styles.body}>{analyse.styleRelationnel || L.notProvided}</Text>
              </View>
            </View>

            <Text style={styles.h2}>{L.bigFive}</Text>

            {analyse.traits?.map((trait, index) => (
              <View key={`${trait.name}-${index}`} style={styles.traitCard} wrap={false}>
                <View style={styles.traitHeader}>
                  <Text style={styles.traitName}>{traitLabel(trait.name ?? '')}</Text>
                  <Text style={styles.scorePill}>{L.score} : {trait.score}/10</Text>
                </View>

                <Text style={styles.body}>
                  {trait.analysis || trait.interpretation || L.analysisUnavailable}
                </Text>

                {trait.observedIndicators && trait.observedIndicators.length > 0 ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.miniTitle, { color: theme.accent }]}>
                      {L.observedIndicators}
                    </Text>
                    {trait.observedIndicators.map((item, indicatorIndex) => (
                      <View key={`${trait.name}-indicator-${indicatorIndex}`} style={styles.bulletRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{item.indicator || ''}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}

            <View style={styles.twoColumns}>
              <View style={[styles.card, styles.column]} wrap={false}>
                <Text style={styles.sectionTitle}>{L.emotionalProfile}</Text>
                <Text style={styles.body}>
                  {L.dominantEmotion} : {analyse.profilEmotionnel?.dominantEmotion || L.notProvidedShort}
                </Text>
                <Text style={[styles.body, { marginTop: 5 }]}>
                  {L.emotionalStability} : {analyse.profilEmotionnel?.emotionalStability || '--'}/10
                </Text>
                <Text style={[styles.body, { marginTop: 10 }]}>
                  {analyse.profilEmotionnel?.emotionalSummary || L.noEmotionalSummary}
                </Text>
              </View>

              <View style={[styles.card, styles.column]} wrap={false}>
                <Text style={styles.sectionTitle}>{L.recommendations}</Text>
                {analyse.recommandations && analyse.recommandations.length > 0 ? (
                  analyse.recommandations.map((recommendation, index) => (
                    <View key={`recommendation-${index}`} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{recommendation.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.body}>{L.noRecommendations}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
