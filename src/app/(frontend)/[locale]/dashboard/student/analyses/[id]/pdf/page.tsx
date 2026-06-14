import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { PrintPdfButton } from '@/components/dashboard/student/PrintPdfButton'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'
type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function StudentAnalysisPdfPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.analyses')
  const locale = await getLocale()

  if (!user) {
    notFound()
  }

  // fallbackLocale: if the target locale is empty (translation failed at save time),
  // Payload returns the other locale's content automatically — no runtime API call needed.
  const analyse = await payload.findByID({
    collection: 'analyse-personnalite',
    id,
    user,
    overrideAccess: false,
    locale: locale as 'fr' | 'en',
    fallbackLocale: locale === 'en' ? 'fr' : 'en',
  })

  if (!analyse) {
    notFound()
  }

  const date = new Date(analyse.date).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const reportWellbeing = getReportWellbeingTheme(analyse.traits)

  const wellbeingKeyMap = {
    pending: { label: t('wellbeing.pending.label'), description: t('wellbeing.pending.description') },
    balanced: { label: t('wellbeing.balanced.label'), description: t('wellbeing.balanced.description') },
    toSupport: { label: t('wellbeing.toSupport.label'), description: t('wellbeing.toSupport.description') },
    sensitive: { label: t('wellbeing.sensitive.label'), description: t('wellbeing.sensitive.description') },
  }
  const wellbeingLabel = wellbeingKeyMap[reportWellbeing.key].label
  const wellbeingDescription = wellbeingKeyMap[reportWellbeing.key].description

  // Translation is handled at save-analysis time (Groq with 3 retries).
  // Here we just read what Payload stored — no external API call at view time.
  const display = {
    overview: analyse.overview,
    conclusion: analyse.conclusion,
    forcesDominantes: analyse.forcesDominantes,
    pointsVigilance: analyse.pointsVigilance,
    styleRelationnel: analyse.styleRelationnel,
    traits: (analyse.traits ?? []).map((trait: any) => ({
      name: trait.name,
      score: trait.score,
      analysis: trait.analysis,
      interpretation: trait.interpretation,
      indicators: (trait.observedIndicators ?? []).map((i: any) => i.indicator ?? '').filter(Boolean),
    })),
    dominantEmotion: analyse.profilEmotionnel?.dominantEmotion,
    emotionalSummary: analyse.profilEmotionnel?.emotionalSummary,
    recommandations: (analyse.recommandations ?? []).map((r: any) => r.text).filter(Boolean),
  }

  return (
    <main className={`report-print-page report-print-page-${reportWellbeing.theme} min-h-screen bg-[var(--mindly-bg)] px-4 py-8 text-[var(--mindly-text-strong)] print:px-0 print:py-0 print:text-slate-900`}>
      <div className={`report-pdf-card report-theme-card report-theme-${reportWellbeing.theme} mx-auto max-w-4xl rounded-[var(--mindly-radius-2xl)] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6 shadow-[var(--mindly-shadow-xl)] print:max-w-none print:rounded-none print:border-0 print:shadow-none md:p-10`}>
        <div className="report-print-header mb-8 flex flex-col gap-4 border-b border-[var(--mindly-border)] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--mindly-primary)]">
              {t('pdf.kicker')}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--mindly-text-strong)]">
              {analyse.reference}
            </h1>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)]">{t('pdf.generatedOn', { date })}</p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="report-wellbeing-pill">
              <span>{wellbeingLabel}</span>
              {reportWellbeing.score !== null ? (
                <strong>{reportWellbeing.score.toFixed(1)}/10</strong>
              ) : null}
            </div>

            <div className="print:hidden">
              <PrintPdfButton analysisId={analyse.id} />
            </div>
          </div>
        </div>

        <div className="hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            {t('pdf.kicker')}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{analyse.reference}</h1>
          <p className="mt-2 text-sm text-slate-600">{t('pdf.generatedOn', { date })}</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="report-highlight-panel rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              {t('pdf.overviewTitle')}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.overview || t('pdf.overviewEmpty')}
            </p>
          </article>

          <article className="report-highlight-panel rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              {t('pdf.conclusionTitle')}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.conclusion || t('pdf.conclusionEmpty')}
            </p>
          </article>
        </section>

        <section className="report-balance-panel mt-6 rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] p-5 print:border-slate-200 print:bg-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
            {t('pdf.balanceTitle')}
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
            {wellbeingLabel}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
            {wellbeingDescription}
          </p>
          {reportWellbeing.score !== null ? (
            <p className="mt-3 text-sm font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              {t('pdf.balanceScore', { score: reportWellbeing.score.toFixed(1) })}
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              {t('pdf.dominantStrengths')}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.forcesDominantes || t('pdf.notProvided')}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              {t('pdf.attentionPoints')}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.pointsVigilance || t('pdf.notProvided')}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              {t('pdf.relationalStyle')}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.styleRelationnel || t('pdf.notProvided')}
            </p>
          </article>
        </section>

        <section className="report-traits-section mt-8">
          <h2 className="text-2xl font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
            {t('pdf.bigFiveTitle')}
          </h2>

          <div className="mt-4 grid gap-4">
            {display.traits.map((trait: { name: string; score: number; analysis?: string | null; interpretation?: string | null; indicators: string[] }, index: number) => (
              <article
                key={`${trait.name}-${index}`}
                className="report-trait-card rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
                    {trait.name}
                  </h3>
                  <span className="report-trait-score inline-flex w-fit rounded-full border border-[#c4b5fd] bg-white px-3 py-1 text-sm font-bold !text-[#1f114f] print:!bg-white print:!text-slate-900">
                    {t('pdf.traitScore', { score: trait.score })}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
                  {trait.analysis || trait.interpretation || t('pdf.traitAnalysisEmpty')}
                </p>

                {trait.indicators.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-400">
                      {t('pdf.observedIndicators')}
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
                      {trait.indicators.map((indicator: string, indicatorIndex: number) => (
                        <li key={`${trait.name}-indicator-${indicatorIndex}`}>{indicator}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              {t('pdf.emotionalProfile')}
            </h2>
            <p className="mt-3 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              {t('pdf.dominantEmotion', { value: display.dominantEmotion || t('pdf.notProvidedShort') })}
            </p>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              {t('pdf.emotionalStability', { value: analyse.profilEmotionnel?.emotionalStability || '--' })}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {display.emotionalSummary || t('pdf.emotionalSummaryEmpty')}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              {t('pdf.recommendations')}
            </h2>

            {display.recommandations.length > 0 ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
                {display.recommandations.map((text, index) => (
                  <li key={`recommendation-${index}`}>{text}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
                {t('pdf.recommendationsEmpty')}
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
