import { Card, CardContent } from '@/components/ui/card'

const avantages = [
  {
    titre: 'Clarté',
    lignes: ['Parcours clairs', 'Informations organisées'],
  },
  {
    titre: 'Sécurité',
    lignes: ['Données protégées', 'Confidentialité renforcée'],
  },
  {
    titre: 'Intelligence',
    lignes: ['Assistance IA', 'Alertes urgentes'],
  },
]

const temoignages = [
  '“J’ai enfin un espace qui comprend mon travail de suivi.”',
  '“Le journal IA me fait gagner du temps et mieux préparer mes séances.”',
  '“Pour le support technique, c’est rapide et efficace.”',
]

export function AvantagesAccompagnement() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#3d1f71] sm:text-4xl">
          Comment ça marche
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {avantages.map((avantage) => (
          <Card key={avantage.titre} className="rounded-[28px] border border-border bg-card/85 p-6 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]">
            <CardContent className="p-0">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8c90ff] text-white">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-[#3d1f71]">{avantage.titre}</h3>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[#6e5d8d]">
                {avantage.lignes.map((ligne) => (
                  <li key={ligne}>• {ligne}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {temoignages.map((temoignage, index) => (
          <Card key={index} className="rounded-[28px] border border-border bg-[#f8f2ff]/80 p-6 shadow-[0_12px_30px_rgba(131,110,181,0.08)] backdrop-blur-[10px]">
            <CardContent className="p-0 text-[#5c4e7f]">
              <p className="text-sm leading-8">{temoignage}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-[30px] bg-gradient-to-r from-[#8c90ff] via-[#a56cf4] to-[#cf5fcf] px-8 py-10 text-center text-white shadow-[0_30px_80px_rgba(140,114,236,0.18)]">
        <h3 className="text-3xl font-bold">Prêt à commencer ?</h3>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/90">
          Sélectionnez votre profil et lancez votre parcours en quelques clics.
        </p>
        <Button variant="secondary" size="pill">
          Accéder à mon accompagnement
        </Button>
      </div>
    </section>
  )
}
