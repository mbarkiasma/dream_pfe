import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyProfilPage() {
  return (
    <div>
      <PsyTopbar
        title="Mon profil"
        description="Consultez vos informations generales et les parametres lies a votre activite."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-[#2d1068] dark:text-white">
                Informations personnelles
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-white/65">
                Cette section affichera plus tard les informations du psychologue connecte : nom,
                email, role et autres informations generales.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">
                Statut du compte
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-white/65">
                Les informations de validation du compte apparaitront ici.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
