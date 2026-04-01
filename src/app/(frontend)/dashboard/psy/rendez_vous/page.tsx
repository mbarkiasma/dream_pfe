import { CalendarDays, Plus } from 'lucide-react'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyRendezVousPage() {
  return (
    <div>
      <PsyTopbar
        title="Rendez-vous"
        description="Consultez et organisez les consultations avec les étudiants."
      />

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Planifier une consultation
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800"> rendez-vous planifié</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-indigo-100 p-3">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="font-medium text-slate-800">Consultations</p>
                  <p className="text-sm text-slate-500">
                    Les rendez-vous confirmés apparaîtront ici automatiquement.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-slate-600">
                Cette section affichera plus tard les consultations avec leur date, leur heure,
                leur statut et les éléments de suivi associés.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Prochaine consultation</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Aucune consultation n'est encore programmée pour le moment.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Suivi de séance</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les éléments liés au suivi des consultations et aux observations du psychologue
                pourront être ajoutés ici plus tard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}