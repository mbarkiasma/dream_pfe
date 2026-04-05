import {
  Card,
  CardContent,
} from '@/components/ui/card'

const items = [
  {
    value: '< 24h',
    label: 'Temps moyen de première réponse',
    bubble: 'bg-[#f7d9ea]',
  },
  {
    value: '4 profils',
    label: 'Étudiant, psychologue, coach, support',
    bubble: 'bg-[#ece3ff]',
  },
  {
    value: '100% privé',
    label: 'Espace de contact sécurisé',
    bubble: 'bg-[#fff0e3]',
  },
  {
    value: 'Suivi ciblé',
    label: 'Orientation vers le bon interlocuteur',
    bubble: 'bg-[#f1ebff]',
  },
]

export function ConfianceContact() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 pb-20">
      <Card
        className="card-hover-premium shimmer-wrap rounded-[32px] border border-white/60 bg-white/70 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]"
        style={{
          animation: 'fadeUpSoft 0.9s ease-out 0.18s both',
        }}
      >
        <CardContent className="p-8">
          <h2 className="anim-fade-up text-4xl font-bold text-[#4d2d7b]">
            Pourquoi nous faire confiance ?
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => (
              <Card
                key={item.label}
                className="card-hover-premium group relative overflow-hidden rounded-[24px] border border-white/60 bg-white/80"
                style={{
                  animation: 'fadeUpSoft 0.75s ease-out both',
                  animationDelay: `${0.24 + index * 0.1}s`,
                }}
              >
                <CardContent className="p-6">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-white/15 via-white/0 to-white/15" />
                    <div className="anim-float-soft absolute right-2 top-2 h-14 w-14 rounded-full bg-white/30 blur-2xl" />
                    <div
                      className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${item.bubble} blur-2xl transition duration-500 group-hover:scale-125`}
                    />
                  </div>

                  <p className="relative text-3xl font-bold text-[#4d2d7b] transition duration-300 group-hover:translate-x-1">
                    {item.value}
                  </p>

                  <p className="relative mt-3 text-[15px] leading-7 text-[#7f6b9f]">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}