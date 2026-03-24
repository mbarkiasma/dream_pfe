import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentStatsCards } from '@/components/dashboard/student/StudentStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentDashboardPage() {
  return (
    <div>
      <StudentTopbar
        title="Dashboard Étudiant"
        description="Bienvenue dans votre espace personnel de suivi des rêves, des analyses et des rendez-vous."
      />

      <StudentStatsCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Mon dernier rêve</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Le dernier rêve enregistré par l’étudiant apparaîtra ici automatiquement après ajout.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Aucun rêve
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Analyse IA</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les analyses générées s’afficheront ici automatiquement après traitement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Prochain rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les séances planifiées avec le psychologue ou le coach apparaîtront ici.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Aucun rendez-vous
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}