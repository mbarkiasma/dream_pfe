import { Card, CardContent } from '@/components/ui/card'

const besoins = [
  {
    icon: '🎓',
    title: 'Étudiant',
    description:
      "Aide sur le journal de rêves, l'analyse IA, l'entretien IA, les rendez-vous ou le chat sécurisé.",
    iconBg: 'from-[#d7c0ff] to-[#b79ef6]',
    softBg: 'bg-[#faf5ff]',
    bubble: 'bg-[#efe5ff]',
  },
  {
    icon: '🧠',
    title: 'Psychologue',
    description:
      'Questions sur les étudiants assignés, les notes, les séances, les rapports IA et le suivi clinique.',
    iconBg: 'from-[#c9b5ff] to-[#9f8df3]',
    softBg: 'bg-[#faf7ff]',
    bubble: 'bg-[#f2eaff]',
  },
  {
    icon: '🏋️',
    title: 'Coach',
    description:
      "Besoin d'aide pour le plan coaching, les tâches, la progression ou l'espace professionnel.",
    iconBg: 'from-[#f6c59f] to-[#eeb1c7]',
    softBg: 'bg-[#fff7f1]',
    bubble: 'bg-[#fff1e6]',
  },
  {
    icon: '⚙️',
    title: 'Support technique',
    description:
      "Problème d'accès, bug, compte, automatisation, réassignation ou alerte urgente.",
    iconBg: 'from-[#cebaff] to-[#b79ef6]',
    softBg: 'bg-[#faf7ff]',
    bubble: 'bg-[#f1ebff]',
  },
]

export function BesoinsContact() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-dream-heading">
          Quel est votre besoin ?
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {besoins.map((item) => (
          <Card
            key={item.title}
            className={`card-hover-premium group relative overflow-hidden rounded-[28px] border border-border ${item.softBg} shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]`}
          >
            <CardContent className="p-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/15 via-white/0 to-white/15" />
                <div className="absolute right-0 top-2 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
                <div className="absolute left-4 top-10 h-10 w-24 rounded-full bg-[#f0e4ff]/50 blur-xl" />
                <div
                  className={`absolute -right-8 -bottom-8 h-28 w-28 rounded-full ${item.bubble} blur-2xl`}
                />
              </div>

              <div
                className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.iconBg} text-4xl shadow-md`}
              >
                <span>{item.icon}</span>
              </div>

              <h3 className="relative text-2xl font-semibold text-dream-heading">
                {item.title}
              </h3>

              <p className="relative mt-4 text-[15px] leading-7 text-dream-muted">
                {item.description}
              </p>

              <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-[#8d76b7] opacity-80">
                <span>Découvrir</span>
                <span>→</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}