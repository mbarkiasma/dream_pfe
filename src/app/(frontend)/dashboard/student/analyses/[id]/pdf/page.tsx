import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PrintPdfButton } from '@/components/dashboard/student/PrintPdfButton'

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
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

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

  return (
    <main className="min-h-screen bg-[var(--mindly-bg)] px-4 py-8 text-[var(--mindly-text-strong)] print:bg-white print:px-0 print:py-0 print:text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[var(--mindly-radius-2xl)] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6 shadow-[var(--mindly-shadow-xl)] print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none md:p-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--mindly-border)] pb-6 print:hidden md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--mindly-primary)]">
              Rapport d'analyse
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--mindly-text-strong)]">
              {analyse.reference}
            </h1>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)]">Genere le {date}</p>
          </div>

          <PrintPdfButton />
        </div>

        <div className="mb-8 hidden border-b border-slate-200 pb-6 print:block">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Rapport d'analyse de personnalite
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{analyse.reference}</h1>
          <p className="mt-2 text-sm text-slate-600">Date : {date}</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Vue d'ensemble
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.overview || "Aucune vue d'ensemble disponible."}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-5 print:bg-slate-50">
            <h2 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
              Conclusion
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.conclusion || 'Aucune conclusion disponible.'}
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Forces dominantes
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.forcesDominantes || 'Non renseigne.'}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Points de vigilance
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.pointsVigilance || 'Non renseigne.'}
            </p>
          </article>

          <article className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-600">
              Style relationnel
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.styleRelationnel || 'Non renseigne.'}
            </p>
          </article>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
            Traits Big Five
          </h2>

          <div className="mt-4 grid gap-4">
            {analyse.traits?.map((trait, index) => (
              <article
                key={`${trait.name}-${index}`}
                className="rounded-[var(--mindly-radius-lg)] border border-[var(--mindly-border)] bg-[var(--mindly-surface-soft)] p-5 shadow-[var(--mindly-shadow-xs)] print:bg-white print:shadow-none"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-bold text-[var(--mindly-text-strong)] print:text-slate-900">
                    {trait.name}
                  </h3>

                  <span className="inline-flex w-fit rounded-full bg-[var(--mindly-gradient-primary)] px-3 py-1 text-sm font-bold text-white print:bg-slate-900 print:text-white">
                    Score : {trait.score}/10
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
                  {trait.analysis || trait.interpretation || 'Analyse non disponible.'}
                </p>

                {trait.observedIndicators && trait.observedIndicators.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--mindly-primary-muted)] print:text-slate-400">
                      Indicateurs observes
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
              Profil emotionnel
            </h2>
            <p className="mt-3 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              Emotion dominante : {analyse.profilEmotionnel?.dominantEmotion || 'Non renseigne'}
            </p>
            <p className="mt-2 text-sm text-[var(--mindly-text-soft)] print:text-slate-700">
              Stabilite emotionnelle : {analyse.profilEmotionnel?.emotionalStability || '--'}/10
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--mindly-text-soft)] print:text-slate-700">
              {analyse.profilEmotionnel?.emotionalSummary || 'Aucun resume emotionnel disponible.'}
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
