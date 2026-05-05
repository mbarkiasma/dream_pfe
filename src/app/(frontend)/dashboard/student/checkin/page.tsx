import { Activity, Moon, SmilePlus } from 'lucide-react'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'

const dailySignals = [
  { icon: SmilePlus, label: 'Humeur', value: '--' },
  { icon: Moon, label: 'Sommeil', value: '--' },
  { icon: Activity, label: 'Stress', value: '--' },
]

export default function StudentCheckinPage() {
  return (
    <div>
      <StudentTopbar
        title="Suivi quotidien"
        description="Renseignez votre etat du jour pour suivre votre bien-etre au fil du temps."
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <section className="mindly-card p-6">
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">Etat du jour</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {dailySignals.map((item) => {
                const Icon = item.icon

                return (
                  <article
                    key={item.label}
                    className="rounded-[var(--mindly-radius-md)] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-4"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-[var(--mindly-text-soft)]">{item.label}</p>
                    <p className="mt-2 text-lg font-bold text-[var(--mindly-text-strong)]">
                      {item.value}
                    </p>
                  </article>
                )
              })}
            </div>

            <p className="mt-5 leading-7 text-[var(--mindly-text-soft)]">
              Cette page affichera plus tard les informations quotidiennes saisies par l'etudiant
              afin d'assurer un suivi simple de son etat emotionnel.
            </p>

            <div className="mt-4">
              <span className="mindly-ui-badge">Donnees dynamiques</span>
            </div>
          </section>
        </div>

        <div className="mindly-stack-lg">
          <section className="mindly-card p-6">
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">Historique</h2>

            <p className="mt-4 leading-7 text-[var(--mindly-text-soft)]">
              L'historique des check-ins quotidiens apparaitra ici automatiquement.
            </p>

            <div className="mt-4">
              <span className="mindly-ui-badge mindly-ui-badge-muted">Aucun historique</span>
            </div>
          </section>

          <section className="mindly-card-soft p-6">
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">Observation</h2>

            <p className="mt-4 leading-7 text-[var(--mindly-text-soft)]">
              Cette section permettra plus tard d'afficher une synthese simple de l'evolution de
              l'humeur, du sommeil et du niveau de stress.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}