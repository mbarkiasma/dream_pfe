import { pdf } from '@react-pdf/renderer'
import config from '@payload-config'
import { getPayload } from 'payload'

import { AnalysisPdfDocument } from '@/components/dashboard/student/AnalysisPdfDocument'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type SupportedLocale = 'fr' | 'en'

function formatAnalysisDate(value: string, locale: SupportedLocale) {
  return new Date(value).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isFilledText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function preferText(primary: unknown, fallback: unknown) {
  return isFilledText(primary) ? primary : isFilledText(fallback) ? fallback : primary
}

function mergeLocalizedAnalysis(primary: any, fallback: any) {
  if (!fallback) return primary

  return {
    ...primary,
    overview: preferText(primary.overview, fallback.overview),
    conclusion: preferText(primary.conclusion, fallback.conclusion),
    forcesDominantes: preferText(primary.forcesDominantes, fallback.forcesDominantes),
    pointsVigilance: preferText(primary.pointsVigilance, fallback.pointsVigilance),
    styleRelationnel: preferText(primary.styleRelationnel, fallback.styleRelationnel),
    profilEmotionnel: {
      ...primary.profilEmotionnel,
      dominantEmotion: preferText(
        primary.profilEmotionnel?.dominantEmotion,
        fallback.profilEmotionnel?.dominantEmotion,
      ),
      emotionalSummary: preferText(
        primary.profilEmotionnel?.emotionalSummary,
        fallback.profilEmotionnel?.emotionalSummary,
      ),
    },
    recommandations: (primary.recommandations ?? fallback.recommandations ?? []).map(
      (recommendation: any, index: number) => ({
        ...recommendation,
        text: preferText(recommendation?.text, fallback.recommandations?.[index]?.text),
      }),
    ),
    traits: (primary.traits ?? fallback.traits ?? []).map((trait: any, index: number) => {
      const fallbackTrait = fallback.traits?.[index]

      return {
        ...trait,
        analysis: preferText(trait?.analysis, fallbackTrait?.analysis),
        interpretation: preferText(trait?.interpretation, fallbackTrait?.interpretation),
        confidenceReason: preferText(trait?.confidenceReason, fallbackTrait?.confidenceReason),
        observedIndicators: (trait?.observedIndicators ?? fallbackTrait?.observedIndicators ?? []).map(
          (indicator: any, indicatorIndex: number) => ({
            ...indicator,
            indicator: preferText(
              indicator?.indicator,
              fallbackTrait?.observedIndicators?.[indicatorIndex]?.indicator,
            ),
          }),
        ),
      }
    }),
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params
  const url = new URL(request.url)
  const rawLocale = url.searchParams.get('locale')
  const locale: SupportedLocale = rawLocale === 'en' ? 'en' : 'fr'

  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const fallbackLocale: SupportedLocale = locale === 'en' ? 'fr' : 'en'
  const analysePrimary = await payload.findByID({
    collection: 'analyse-personnalite',
    id,
    user,
    overrideAccess: false,
    locale,
    fallbackLocale,
  })

  if (!analysePrimary) {
    return new Response('Analyse introuvable', { status: 404 })
  }

  const analyseFallback = await payload.findByID({
    collection: 'analyse-personnalite',
    id,
    user,
    overrideAccess: false,
    locale: fallbackLocale,
    fallbackLocale: locale,
  }).catch(() => null)

  const analyse = mergeLocalizedAnalysis(analysePrimary, analyseFallback)

  const document = (
    <AnalysisPdfDocument
      analyse={analyse}
      date={formatAnalysisDate(analyse.date, locale)}
      reportWellbeing={getReportWellbeingTheme(analyse.traits)}
      locale={locale}
    />
  )
  const stream = await pdf(document).toBuffer()
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const buffer = Buffer.concat(chunks)
  const filename = `${analyse.reference || 'rapport-mindbloom'}.pdf`

  return new Response(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.byteLength),
      'Content-Type': 'application/pdf',
    },
  })
}
