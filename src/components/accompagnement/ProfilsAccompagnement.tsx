import { Card, CardContent } from '@/components/ui/card'

const profils = [
  {
    emoji: '🎓',
    titre: 'Étudiant',
    texte: "Journal de rêves, préparation d'entretien, chat sécurisé.",
    accent: 'from-[#c3a4ff] to-[#8c90ff]',
  },
  {
    emoji: '🧠',
    titre: 'Psychologue',
    texte: 'Suivi des étudiants, notes, séances, rapports IA.',
    accent: 'from-[#f3b6ff] to-[#b79ef6]',
  },
  {
    emoji: '🏋️',
    titre: 'Coach',
    texte: "Plan coaching, tâches, progression, espace professionnel.",
    accent: 'from-[#ffbb82] to-[#ff8d9b]',
  },
  {
    emoji: '⚙️',
    titre: 'Support technique',
    texte: 'Aide accès, bug, compte, automatisation, alertes.',
    accent: 'from-[#b49dff] to-[#8c90ff]',
  },
]

export function ProfilsAccompagnement() {
  return (
    <section id="profils" className="mx-auto max-w-7xl px-6 py-10">
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
          <h3 className="text-2xl font-semibold text-[#3d1f71]">Ce que vous pouvez faire ici</h3>
          <ul className="mt-6 space-y-4 text-sm leading-8 text-[#6e5d8d]">
            <li>• Créer et consulter votre journal de rêves</li>
            <li>• Lancer une analyse IA de vos données</li>
            <li>• Planifier et centraliser vos rendez-vous</li>
            <li>• Télécharger des templates de séance</li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-[#f8f3ff]/90 p-6 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/80 p-4 text-center text-[#4d2d7b] shadow-sm">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8c90ff] text-white">1</div>
              <p className="text-sm font-semibold">Sélectionnez votre profil</p>
            </div>
            <div className="rounded-[24px] bg-white/80 p-4 text-center text-[#4d2d7b] shadow-sm">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8c90ff] text-white">2</div>
              <p className="text-sm font-semibold">Parcourez les outils dédiés</p>
            </div>
            <div className="rounded-[24px] bg-white/80 p-4 text-center text-[#4d2d7b] shadow-sm">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8c90ff] text-white">3</div>
              <p className="text-sm font-semibold">Recevez assistance IA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
