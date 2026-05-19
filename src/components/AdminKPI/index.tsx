import config from '@payload-config'
import { getPayload } from 'payload'

import type { AnalysePersonnalite } from '@/payload-types'

type TraitName = NonNullable<NonNullable<AnalysePersonnalite['traits']>[number]['name']>

const traitNames: TraitName[] = [
  'Ouverture',
  'Conscienciosite',
  'Extraversion',
  'Agreabilite',
  'Neuroticisme',
]

function round(value: number) {
  return Number(value.toFixed(1))
}

function percent(part: number, total: number) {
  if (total <= 0) return 0

  return Math.round((part / total) * 100)
}

function buildAnalysisStats(analyses: AnalysePersonnalite[]) {
  const traitTotals = new Map<TraitName, { count: number; total: number }>(
    traitNames.map((name) => [name, { count: 0, total: 0 }]),
  )
  const confidenceCounts = {
    eleve: 0,
    moyen: 0,
    modere: 0,
  }

  let scoreCount = 0
  let scoreTotal = 0
  let watchCount = 0

  for (const analyse of analyses) {
    if (analyse.niveauConfiance) {
      confidenceCounts[analyse.niveauConfiance] += 1
    }

    const traits = analyse.traits || []
    const neuroticism = traits.find((trait) => trait.name === 'Neuroticisme')

    if (analyse.niveauConfiance === 'modere' || (neuroticism?.score || 0) >= 7) {
      watchCount += 1
    }

    for (const trait of traits) {
      if (!trait.name || typeof trait.score !== 'number') continue

      const current = traitTotals.get(trait.name)
      if (!current) continue

      current.count += 1
      current.total += trait.score
      scoreCount += 1
      scoreTotal += trait.score
    }
  }

  const traitAverages = traitNames.map((name) => {
    const current = traitTotals.get(name)
    const count = current?.count || 0

    return {
      name,
      count,
      average: count > 0 && current ? round(current.total / count) : 0,
    }
  })

  return {
    confidenceCounts,
    globalAverage: scoreCount > 0 ? round(scoreTotal / scoreCount) : 0,
    scoreCount,
    traitAverages,
    watchCount,
  }
}

export default async function AdminKPI() {
  const payload = await getPayload({ config })

  const [students, analysesResult, appointments, sessions] = await Promise.all([
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 0,
      where: {
        role: {
          equals: 'etudiant',
        },
      },
    }),
    payload.find({
      collection: 'analyse-personnalite',
      depth: 0,
      limit: 1000,
      sort: '-date',
    }),
    payload.find({
      collection: 'rendez-vous-psy',
      depth: 0,
      limit: 0,
    }),
    payload.find({
      collection: 'coaching-sessions',
      depth: 0,
      limit: 0,
    }),
  ])

  const analyses = analysesResult.docs as AnalysePersonnalite[]
  const stats = buildAnalysisStats(analyses)
  const coverageRate = percent(analysesResult.totalDocs, students.totalDocs)
  const cards = [
    {
      label: 'Etudiants',
      value: students.totalDocs,
      description: 'Comptes avec le role etudiant',
    },
    {
      label: 'Analyses Big Five',
      value: analysesResult.totalDocs,
      description: `${coverageRate}% de couverture`,
    },
    {
      label: 'Score moyen',
      value: `${stats.globalAverage}/10`,
      description: `${stats.scoreCount} scores exploites`,
    },
    {
      label: 'Cas a surveiller',
      value: stats.watchCount,
      description: 'Confiance moderee ou neuroticisme eleve',
    },
    {
      label: 'Rendez-vous psy',
      value: appointments.totalDocs,
      description: 'Demandes et suivis',
    },
    {
      label: 'Sessions coaching',
      value: sessions.totalDocs,
      description: 'Smart coach et coaching classique',
    },
  ]

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '4px' }}>Statistiques globales</h2>
        <p style={{ color: 'var(--theme-elevation-600)', margin: 0 }}>
          KPI administrateur bases sur les analyses de personnalite des etudiants.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginBottom: '24px',
        }}
      >
        {cards.map((card) => (
          <article
            key={card.label}
            style={{
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '6px',
              padding: '18px',
            }}
          >
            <p
              style={{
                color: 'var(--theme-elevation-600)',
                fontSize: '13px',
                fontWeight: 600,
                margin: '0 0 8px',
              }}
            >
              {card.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1, margin: '0 0 10px' }}>
              {card.value}
            </p>
            <p style={{ color: 'var(--theme-elevation-600)', margin: 0 }}>{card.description}</p>
          </article>
        ))}
      </div>

      <div
        style={{
          display: 'block',
        }}
      >
        <section
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '6px',
            padding: '18px',
          }}
        >
          <h3 style={{ margin: '0 0 16px' }}>Moyenne des traits Big Five</h3>

          <div style={{ display: 'grid', gap: '14px' }}>
            {stats.traitAverages.map((trait) => (
              <div key={trait.name}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{trait.name}</span>
                  <span>
                    {trait.average}/10 ({trait.count})
                  </span>
                </div>
                <div
                  style={{
                    background: 'var(--theme-elevation-100)',
                    borderRadius: '999px',
                    height: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--theme-success-500)',
                      height: '100%',
                      width: `${trait.average * 10}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
