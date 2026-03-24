import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentAnalysesPage() {
  return (
    <div>
      <StudentTopbar
        title="Mes analyses"
        description="Consulte les interprétations et résumés générés à partir de vos rêves."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-slate-800">Aucune analyse disponible</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                En attente
              </span>
            </div>

            <p className="leading-7 text-slate-600">
              Les analyses IA apparaîtront ici automatiquement après l’enregistrement et le traitement
              des rêves de l’étudiant.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-800">Historique des interprétations</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-slate-600">
              Cette section affichera plus tard la liste des analyses passées, leur date, leur statut,
              ainsi que les résumés associés à chaque rêve.
            </p>

            <div className="mt-4">
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                Données dynamiques
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}