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
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]"> rendez-vous planifié</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-indigo-100 p-3">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="font-medium text-[#2d1068]">Consultations</p>
                  <p className="text-sm text-[#7A6A99]">
                    Les rendez-vous confirmés apparaîtront ici automatiquement.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-[#6E628F]">
                Cette section affichera plus tard les consultations avec leur date, leur heure,
                leur statut et les éléments de suivi associés.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Prochaine consultation</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Aucune consultation n&apos;est encore programmée pour le moment.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Suivi de séance</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
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
