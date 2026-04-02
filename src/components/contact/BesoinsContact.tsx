const besoins = [
  {
    icon: '🎓',
    title: 'Étudiant',
    description:
      "Aide sur le journal de rêves, l'analyse IA, l'entretien IA, les rendez-vous ou le chat sécurisé.",
    iconBg: 'from-[#d7c0ff] to-[#b79ef6]',
    softBg: 'bg-[#faf5ff]',
  },
  {
    icon: '🧠',
    title: 'Psychologue',
    description:
      'Questions sur les étudiants assignés, les notes, les séances, les rapports IA et le suivi clinique.',
    iconBg: 'from-[#c9b5ff] to-[#9f8df3]',
    softBg: 'bg-[#faf7ff]',
  },
  {
    icon: '🏋️',
    title: 'Coach',
    description:
      "Besoin d'aide pour le plan coaching, les tâches, la progression ou l'espace professionnel.",
    iconBg: 'from-[#f6c59f] to-[#eeb1c7]',
    softBg: 'bg-[#fff7f1]',
  },
  {
    icon: '⚙️',
    title: 'Support technique',
    description:
      "Problème d'accès, bug, compte, automatisation, réassignation ou alerte urgente.",
    iconBg: 'from-[#cebaff] to-[#b79ef6]',
    softBg: 'bg-[#faf7ff]',
  },
]

export function BesoinsContact() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-[#4d2d7b]">
          Quel est votre besoin ?
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {besoins.map((item) => (
          <div
            key={item.title}
            className={`group relative overflow-hidden rounded-[28px] border border-white/60 ${item.softBg} p-6 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(131,110,181,0.18)]`}
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/10 via-white/0 to-white/10" />
            <div className="absolute right-0 top-2 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute left-4 top-10 h-10 w-24 rounded-full bg-[#f0e4ff]/50 blur-xl" />

            <div
              className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.iconBg} text-4xl shadow-md`}
            >
              {item.icon}
            </div>

            <h3 className="relative text-2xl font-semibold text-[#4d2d7b]">
              {item.title}
            </h3>

            <p className="relative mt-4 text-[15px] leading-7 text-[#7f6b9f]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}