import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyDashboardPage() {
  return (
    <div>
      <PsyTopbar
        title="Dashboard Psychologue"
        description="Bienvenue dans votre espace de suivi clinique des étudiants et des rendez-vous."
      />

      <PsyStatsCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Étudiants assignés</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les étudiants orientés vers le psychologue apparaîtront ici avec leurs informations
                principales et leur état général.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les consultations prévues avec les étudiants seront affichées ici.
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Suivi clinique</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Cette section affichera plus tard les cas nécessitant une attention particulière
                ainsi que les observations générales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}