import React from 'react'
import { Moon, Sparkles, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Feature = {
  id?: string
  icon: 'moon' | 'sparkles' | 'messageCircle'
  title: string
  description: string
}

type Props = {
  title: string
  features: Feature[]
}

const iconMap = {
  moon: Moon,
  sparkles: Sparkles,
  messageCircle: MessageCircle,
}

export const SecondBlocAccueilBlock: React.FC<Props> = ({ title, features }) => {
  return (
    <section className="relative overflow-hidden bg-dream-soft px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#4B3F72] md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features?.map((feature, index) => {
            const Icon = iconMap[feature.icon]

            return (
             <Card
  key={feature.id || index}
  className="group rounded-[24px] border border-white/50 bg-card/70 shadow-[0_10px_40px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:rounded-[32px] hover:border-border hover:bg-white/95 hover:shadow-[0_20px_60px_rgba(109,40,217,0.28),0_10px_30px_rgba(76,29,149,0.22)]"
>
  <CardContent className="px-6 py-8 text-center">
    <div className="mb-5 flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dream-highlight transition-all duration-300 group-hover:scale-110 group-hover:rounded-[20px] group-hover:bg-white">
        <Icon className="h-8 w-8 text-[#8B5CF6]" />
      </div>
    </div>

    <h3 className="mb-3 text-xl font-semibold text-[#4B3F72]">
      {feature.title}
    </h3>

    <p className="text-sm leading-7 text-dream-muted md:text-base">
      {feature.description}
    </p>
  </CardContent>
</Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}