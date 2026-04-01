import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyProfilPage() {
  return (
    <div>
      <PsyTopbar
        title="Mon profil"
        description="Consultez vos informations générales et les paramètres liés à votre activité."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-800">Informations personnelles</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Cette section affichera plus tard les informations du psychologue connecté : nom,
                email, rôle et autres informations générales.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Statut du compte</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}