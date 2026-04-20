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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl rounded-[28px] bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] print:max-w-none print:rounded-none print:shadow-none md:p-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 print:hidden md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Rapport d’analyse
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{analyse.reference}</h1>
            <p className="mt-2 text-sm text-[#7A6A99]">
              Généré le{' '}
              {new Date(analyse.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <PrintPdfButton />
        </div>

        <div className="mb-8 hidden border-b border-slate-200 pb-6 print:block">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Rapport d’analyse de personnalité
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{analyse.reference}</h1>
          <p className="mt-2 text-sm text-[#7A6A99]">
            Date :{' '}
            {new Date(analyse.date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Vue d’ensemble</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.overview || 'Aucune vue d’ensemble disponible.'}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Conclusion</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.conclusion || 'Aucune conclusion disponible.'}
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6A99]">
              Forces dominantes
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.forcesDominantes || 'Non renseigné.'}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6A99]">
              Points de vigilance
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.pointsVigilance || 'Non renseigné.'}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6A99]">
              Style relationnel
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.styleRelationnel || 'Non renseigné.'}
            </p>
          </article>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-slate-900">Traits Big Five</h2>
          <div className="mt-4 grid gap-4">
            {analyse.traits?.map((trait, index) => (
              <article key={`${trait.name}-${index}`} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{trait.name}</h3>
                  <span className="inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                    Score : {trait.score}/10
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {trait.analysis || trait.interpretation || 'Analyse non disponible.'}
                </p>

                {trait.observedIndicators && trait.observedIndicators.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Indicateurs observés
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
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
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Profil émotionnel</h2>
            <p className="mt-3 text-sm text-slate-700">
              Emotion dominante : {analyse.profilEmotionnel?.dominantEmotion || 'Non renseigné'}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Stabilité émotionnelle : {analyse.profilEmotionnel?.emotionalStability || '--'}/10
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {analyse.profilEmotionnel?.emotionalSummary || 'Aucun résumé émotionnel disponible.'}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Recommandations</h2>
            {analyse.recommandations && analyse.recommandations.length > 0 ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                {analyse.recommandations.map((recommendation, index) => (
                  <li key={`recommendation-${index}`}>{recommendation.text}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-700">Aucune recommandation disponible.</p>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
