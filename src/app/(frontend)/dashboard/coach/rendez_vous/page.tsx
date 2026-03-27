import { CalendarDays, Plus } from 'lucide-react'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachAppointmentsPage() {
  return (
    <div>
      <CoachTopbar
        title="Rendez-vous"
        description="Planifiez et gérez les séances de coaching avec les étudiants."
      />

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Planifier une séance
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Aucun rendez-vous planifié</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-indigo-100 p-3">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="font-medium text-slate-800">Séances à venir</p>
                  <p className="text-sm text-slate-500">
                    Les rendez-vous confirmés apparaîtront ici automatiquement.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-slate-600">
                Les séances de coaching apparaîtront ici avec leur date, leur heure, leur statut et les notes associées.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Prochaine séance</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Aucune séance n&apos;est encore programmée pour le moment.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Aucun rendez-vous
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Notes de séance</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Le coach pourra ajouter plus tard des notes privées et des notes partageables avec l’étudiant.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                  Fonction à venir
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}