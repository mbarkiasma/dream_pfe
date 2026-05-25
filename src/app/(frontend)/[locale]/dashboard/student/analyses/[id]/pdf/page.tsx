import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PrintPdfButton } from '@/components/dashboard/student/PrintPdfButton'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function formatAnalysisDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function StudentAnalysisPdfPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    notFound()
  }

  const analyse = await payload.findByID({
    collection: 'analyse-personnalite',
    id,
    user,
    overrideAccess: false,
  })

  if (!analyse) {
    notFound()
  }

  const date = formatAnalysisDate(analyse.date)
  const reportWellbeing = getReportWellbeingTheme(analyse.traits)

  return (
    <main className={`report-print-page report-print-page-${reportWellbeing.theme} min-h-screen bg-[var(--mindly-bg)] px-4 py-8 text-[var(--mindly-text-strong)] print:px-0 print:py-0 print:text-slate-900`}>
      <div className={`report-pdf-card report-theme-card report-theme-${reportWellbeing.theme} mx-auto max-w-4xl rounded-[var(--mindly-radius-2xl)] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6 shadow-[var(--mindly-shadow-xl)] print:max-w-none print:rounded-none print:border-0 print:shadow-none md:p-10`}>
        <div className="report-print-header mb-8 flex flex-col gap-4 border-b border-[var(--mindly-border)] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--mindly-primary)]">
              Rapport d&apos;analyse
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--mindly-text-strong)]">
              {analyse.reference}
            </h1>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)]">Généré le {date}</p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="report-wellbeing-pill">
              <span>{reportWellbeing.label}</span>
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
            Rapport d&apos;analyse de personnalité
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{analyse.reference}</h1>
          <p className="mt-2 text-sm text-slate-600">Date : {date}</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="report-highlight-panel rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Vue d&apos;ensemble
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.overview || "Aucune vue d'ensemble disponible."}
            </p>
          </article>

          <article className="report-highlight-panel rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Conclusion
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.conclusion || 'Aucune conclusion disponible.'}
            </p>
          </article>
        </section>

        <section className="report-balance-panel mt-6 rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] p-5 print:border-slate-200 print:bg-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
            Indice d&apos;équilibre
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
            {reportWellbeing.label}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
            {reportWellbeing.description}
          </p>
          {reportWellbeing.score !== null ? (
            <p className="mt-3 text-sm font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Score d&apos;équilibre : {reportWellbeing.score.toFixed(1)}/10
            </p>
          ) : null}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Forces dominantes
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.forcesDominantes || 'Non renseigné.'}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Points de vigilance
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.pointsVigilance || 'Non renseigné.'}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Style relationnel
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.styleRelationnel || 'Non renseigné.'}
            </p>
          </article>
        </section>

        <section className="report-traits-section mt-8">
          <h2 className="text-2xl font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
            Traits Big Five
          </h2>

          <div className="mt-4 grid gap-4">
            {analyse.traits?.map((trait, index) => (
              <article
                key={`${trait.name}-${index}`}
                className="report-trait-card rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
                    {trait.name}
                  </h3>

                  <span className="report-trait-score inline-flex w-fit rounded-full border border-[#c4b5fd] bg-white px-3 py-1 text-sm font-bold !text-[#1f114f] print:!bg-white print:!text-slate-900">
                    Score : {trait.score}/10
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
                  {trait.analysis || trait.interpretation || 'Analyse non disponible.'}
                </p>

                {trait.observedIndicators && trait.observedIndicators.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-400">
                      Indicateurs observés
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
                      {trait.observedIndicators.map((item, indicatorIndex) => (
                        <li key={`${trait.name}-indicator-${indicatorIndex}`}>{item.indicator}</li>
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
              Profil émotionnel
            </h2>
            <p className="mt-3 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              Émotion dominante : {analyse.profilEmotionnel?.dominantEmotion || 'Non renseigné'}
            </p>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              Stabilité émotionnelle : {analyse.profilEmotionnel?.emotionalStability || '--'}/10
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.profilEmotionnel?.emotionalSummary || 'Aucun résumé émotionnel disponible.'}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Recommandations
            </h2>

            {analyse.recommandations && analyse.recommandations.length > 0 ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
                {analyse.recommandations.map((recommendation, index) => (
                  <li key={`recommendation-${index}`}>{recommendation.text}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
                Aucune recommandation disponible.
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
