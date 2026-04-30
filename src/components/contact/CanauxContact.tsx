import {
  Card,
  CardContent,
} from '@/components/ui/card'

const canaux = [
  {
    icon: '✉️',
    title: 'Support général',
    value: 'contact@dream.com',
    description: 'Pour toute demande générale',
    iconBg: 'from-[#efbfd7] to-[#b79ef6]',
    bubble: 'bg-[#f7d9ea]',
  },
  {
    icon: '⚙️',
    title: 'Support technique',
    value: 'support@dream.com',
    description: 'Accès, bug ou problème technique',
    iconBg: 'from-[#d7c0ff] to-[#8c90ff]',
    bubble: 'bg-[#ece3ff]',
  },
  {
    icon: '📞',
    title: 'Demandes urgentes',
    value: '+216 XX XXX XXX',
    description: 'Réponse prioritaire pour les situations critiques',
    iconBg: 'from-[#f6c59f] to-[#efbfd7]',
    bubble: 'bg-[#fff0e3]',
  },
  {
    icon: '📅',
    title: 'Disponibilité',
    value: 'Lundi - Vendredi, 9h - 18h',
    description: 'Horaires de réponse de l’équipe',
    iconBg: 'from-[#cebaff] to-[#b79ef6]',
    bubble: 'bg-[#f1ebff]',
  },
]

export function CanauxContact() {
  return (
    <section id="canaux-contact" className="rounded-[30px]">
      <h2 className="anim-fade-up mb-6 text-4xl font-bold text-dream-heading">
        Contactez-nous facilement
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {canaux.map((item, index) => (
          <Card
            key={item.title}
            className="card-hover-premium group relative overflow-hidden rounded-[24px] border border-border bg-card/75 shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]"
            style={{
              animation: 'fadeUpSoft 0.8s ease-out both',
              animationDelay: `${0.08 + index * 0.1}s`,
            }}
          >
            <CardContent className="p-5">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-white/15 via-white/0 to-white/15" />
                <div className="anim-float-soft absolute right-2 top-2 h-16 w-16 rounded-full bg-white/30 blur-2xl" />
                <div
                  className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${item.bubble} blur-2xl transition duration-500 group-hover:scale-125`}
                />
              </div>

              <div className="relative flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg} text-2xl text-white shadow-md transition duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <span className="anim-float-soft">{item.icon}</span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-dream-heading transition duration-300 group-hover:translate-x-1">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}