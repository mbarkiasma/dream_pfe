import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachProfilePage() {
  return (
    <div>
      <CoachTopbar
        title="Mon profil"
        description="Consultez vos informations generales et les parametres lies a votre activite de coach."
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
                Cette section affichera plus tard les informations du coach connecte : nom, email,
                role et informations generales.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-white/70">
                  Donnees utilisateur
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
