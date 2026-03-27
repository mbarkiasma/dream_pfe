import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachStudentsPage() {
  return (
    <div>
      <CoachTopbar
        title="Étudiants assignés"
        description="Consultez les profils des étudiants suivis par le coach."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-slate-800">Aucun étudiant assigné</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-slate-600">
              Les profils des étudiants attribués au coach apparaîtront ici avec leurs informations
              principales, leur état général et leur suivi.
            </p>

            <div className="mt-4">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Aucun étudiant
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-800">Informations</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-slate-600">
              Cette page permettra plus tard d’accéder au profil étudiant, à ses rêves, à ses analyses,
              à ses tâches et à ses notes de coaching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}