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
        <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[#2d1068]">Aucun étudiant assigné</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F]">
              Les profils des étudiants attribués au coach apparaîtront ici avec leurs informations
              principales, leur état général et leur suivi.
            </p>

            <div className="mt-4">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                Aucun étudiant
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#2d1068]">Informations</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F]">
              Cette page permettra plus tard d’accéder au profil étudiant, à ses rêves, à ses analyses,
              à ses tâches et à ses notes de coaching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}