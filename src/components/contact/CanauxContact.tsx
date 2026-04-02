const canaux = [
  {
    icon: '✉️',
    title: 'Support général',
    value: 'contact@dream.com',
    description: 'Pour toute demande générale',
    iconBg: 'from-[#efbfd7] to-[#b79ef6]',
  },
  {
    icon: '⚙️',
    title: 'Support technique',
    value: 'support@dream.com',
    description: 'Accès, bug ou problème technique',
    iconBg: 'from-[#d7c0ff] to-[#8c90ff]',
  },
  {
    icon: '📞',
    title: 'Demandes urgentes',
    value: '+216 XX XXX XXX',
    description: 'Réponse prioritaire pour les situations critiques',
    iconBg: 'from-[#f6c59f] to-[#efbfd7]',
  },
  {
    icon: '📅',
    title: 'Disponibilité',
    value: 'Lundi - Vendredi, 9h - 18h',
    description: 'Horaires de réponse de l’équipe',
    iconBg: 'from-[#cebaff] to-[#b79ef6]',
  },
]

export function CanauxContact() {
  return (
    <section id="canaux-contact" className="rounded-[30px]">
      <h2 className="mb-6 text-4xl font-bold text-[#4d2d7b]">
        Contactez-nous facilement
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {canaux.map((item) => (
          <div
            key={item.title}
            className="rounded-[24px] border border-white/60 bg-white/75 p-5 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg} text-2xl text-white shadow-md`}
              >
                {item.icon}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#4d2d7b]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#5e458b]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#8a76aa]">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}