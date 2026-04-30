import { Card, CardContent } from '@/components/ui/card'

const etapes = [
  {
    numero: '1',
    titre: 'Sélectionnez votre profil',
    texte: 'Étudiant, psychologue, coach ou support technique : commencez par choisir votre point d’entrée.',
  },
  {
    numero: '2',
    titre: 'Parcourez les outils',
    texte: 'Découvrez les fonctions dédiées à votre besoin et gardez une vue d’ensemble claire.',
  },
  {
    numero: '3',
    titre: 'Recevez du soutien',
    texte: 'Bénéficiez de recommandations IA et d’un accompagnement adapté à votre situation.',
  },
]

export function ProcessusAccompagnement() {
  return (
    <section id="processus" className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#8c90ff]">
          Comment ça marche
        </p>
        <h2 className="text-3xl font-bold text-dream-heading sm:text-4xl">
          Un déroulé simple en trois étapes
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {etapes.map((etape) => (
          <Card key={etape.numero} className="border border-border bg-card/80 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8c90ff] text-lg font-bold text-white">
                {etape.numero}
              </div>
              <h3 className="text-xl font-semibold text-dream-heading">{etape.titre}</h3>
              <p className="mt-3 text-sm leading-7 text-dream-muted">{etape.texte}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
