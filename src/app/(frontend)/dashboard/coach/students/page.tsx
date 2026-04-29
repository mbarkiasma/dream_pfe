import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachStudentsPage() {
  return (
    <div>
      <CoachTopbar
        title="Etudiants assignes"
        description="Consultez les profils des etudiants suivis par le coach."
      />

      <div className="space-y-6">
        <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[#2d1068] dark:text-white">
              Aucun etudiant assigne
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F] dark:text-white/65">
              Les profils des etudiants attribues au coach apparaitront ici avec leurs informations
              principales, leur etat general et leur suivi.
            </p>

            <div className="mt-4">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                Aucun etudiant
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#2d1068] dark:text-white">Informations</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-[#6E628F] dark:text-white/65">
              Cette page permettra plus tard d'acceder au profil etudiant, a ses reves, a ses
              analyses, a ses taches et a ses notes de coaching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
