import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { CoachStatsCards } from '@/components/dashboard/coach/CoachStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachDashboardPage() {
  return (
    <div>
      <CoachTopbar
        title="Dashboard Coach"
        description="Bienvenue dans votre espace de suivi des etudiants, des exercices et des rendez-vous."
      />

      <CoachStatsCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Etudiants a suivre
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
                Les etudiants assignes au coach apparaitront ici avec leur etat general, leurs
                exercices en cours et leurs besoins d'accompagnement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                  Aucun etudiant
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Exercices recents
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
                Les exercices ou taches les plus recents apparaitront ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Orientation vers psychologue
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
                Les etudiants necessitant une orientation clinique seront affiches ici pour
                transmission au psychologue.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-dream-highlight px-3 py-1 text-xs font-medium text-dream-accent dark:bg-violet-400/15 dark:text-violet-100">
                  Aucun cas
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
