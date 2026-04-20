import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentCheckinPage() {
  return (
    <div>
      <StudentTopbar
        title="Suivi quotidien"
        description="Renseignez votre état du jour pour suivre votre bien-être au fil du temps."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">État du jour</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-[#7A6A99]">Humeur</p>
                  <p className="mt-2 text-lg font-semibold text-[#2d1068]">--</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-[#7A6A99]">Sommeil</p>
                  <p className="mt-2 text-lg font-semibold text-[#2d1068]">--</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-[#7A6A99]">Stress</p>
                  <p className="mt-2 text-lg font-semibold text-[#2d1068]">--</p>
                </div>
              </div>

              <p className="leading-7 text-[#6E628F]">
                Cette page affichera plus tard les informations quotidiennes saisies par l’étudiant
                afin d’assurer un suivi simple de son état émotionnel.
              </p>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  Données dynamiques
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Historique</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                L’historique des check-ins quotidiens apparaîtra ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  Aucun historique
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Observation</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Cette section permettra plus tard d’afficher une synthèse simple de l’évolution de
                l’humeur, du sommeil et du niveau de stress.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}