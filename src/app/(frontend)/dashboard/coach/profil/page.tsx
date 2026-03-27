import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachProfilePage() {
  return (
    <div>
      <CoachTopbar
        title="Mon profil"
        description="Consultez vos informations générales et les paramètres liés à votre activité de coach."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-800">Informations personnelles</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Cette section affichera plus tard les informations du coach connecté : nom, email, rôle
                et informations générales.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Données utilisateur
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}