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
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">État du jour</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Humeur</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">--</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Sommeil</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">--</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Stress</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">--</p>
                </div>
              </div>

              <p className="leading-7 text-slate-600">
                Cette page affichera plus tard les informations quotidiennes saisies par l’étudiant
                afin d’assurer un suivi simple de son état émotionnel.
              </p>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Données dynamiques
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Historique</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                L’historique des check-ins quotidiens apparaîtra ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Aucun historique
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Observation</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
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