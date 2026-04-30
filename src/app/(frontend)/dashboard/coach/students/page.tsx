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
        <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-dream-heading dark:text-white">
              Aucun etudiant assigne
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-dream-muted dark:text-white/65">
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

        <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-dream-heading dark:text-white">Informations</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="leading-7 text-dream-muted dark:text-white/65">
              Cette page permettra plus tard d'acceder au profil etudiant, a ses reves, a ses
              analyses, a ses taches et a ses notes de coaching.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
