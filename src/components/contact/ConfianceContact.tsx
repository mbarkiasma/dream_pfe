const items = [
  {
    value: '< 24h',
    label: 'Temps moyen de première réponse',
  },
  {
    value: '4 profils',
    label: 'Étudiant, psychologue, coach, support',
  },
  {
    value: '100% privé',
    label: 'Espace de contact sécurisé',
  },
  {
    value: 'Suivi ciblé',
    label: 'Orientation vers le bon interlocuteur',
  },
]

export function ConfianceContact() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 pb-20">
      <div className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
        <h2 className="text-4xl font-bold text-[#4d2d7b]">
          Pourquoi nous faire confiance ?
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-white/60 bg-white/80 p-6"
            >
              <p className="text-3xl font-bold text-[#4d2d7b]">{item.value}</p>
              <p className="mt-3 text-[15px] leading-7 text-[#7f6b9f]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}