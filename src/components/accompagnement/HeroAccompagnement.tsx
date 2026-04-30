import { Button } from '@/components/ui/button'

const profils = [
  { emoji: '🎓', label: 'Étudiant' },
  { emoji: '🧠', label: 'Psychologue' },
  { emoji: '🏋️', label: 'Coach' },
  { emoji: '⚙️', label: 'Support technique' },
]

export function HeroAccompagnement() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-10">
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[#3d1f71] sm:text-6xl">
          Accompagnement personnalisé
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-8 text-[#5b4b7a]">
          Choisissez votre profil et accédez à un parcours adapté : étudiant,
          psychologue, coach.
        </p>

        <div className="grid auto-cols-fr gap-6 sm:grid-cols-4">
          {profils.map((profil) => (
            <div key={profil.label} className="rounded-[28px] border border-border bg-card/80 p-6 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d7c0ff] via-[#b79ef6] to-[#8c90ff] text-3xl text-white shadow-lg">
                {profil.emoji}
              </div>
              <p className="text-base font-semibold text-dream-heading">{profil.label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto max-w-3xl text-base leading-8 text-[#6f5d8e]">
          Cette page rassemble toutes les ressources et actions pour vous accompagner au bon moment.
          Que vous soyez étudiant ou professionnel, vous trouverez ici des parcours clairs et des outils pratiques pour avancer sereinement.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="dream" size="pillLg">
          Accéder à mon accompagnement
        </Button>
      </div>
    </section>
  )
}
