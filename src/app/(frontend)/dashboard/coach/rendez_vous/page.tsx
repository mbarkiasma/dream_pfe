import { CalendarDays, Plus } from 'lucide-react'

import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachAppointmentsPage() {
  return (
    <div>
      <CoachTopbar
        title="Rendez-vous"
        description="Planifiez et gerez les seances de coaching avec les etudiants."
      />

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Planifier une seance
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Aucun rendez-vous planifie
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-400/15">
                  <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-200" />
                </div>

                <div>
                  <p className="font-medium text-dream-heading dark:text-white">Seances a venir</p>
                  <p className="text-sm text-[#7A6A99] dark:text-white/60">
                    Les rendez-vous confirmes apparaitront ici automatiquement.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-dream-muted dark:text-white/65">
                Les seances de coaching apparaitront ici avec leur date, leur heure, leur statut et
                les notes associees.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Prochaine seance
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
                Aucune seance n&apos;est encore programmee pour le moment.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                  Aucun rendez-vous
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Notes de seance
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
                Le coach pourra ajouter plus tard des notes privees et des notes partageables avec
                l'etudiant.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-dream-highlight px-3 py-1 text-xs font-medium text-dream-accent dark:bg-violet-400/15 dark:text-violet-100">
                  Fonction a venir
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
