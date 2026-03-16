import React from 'react'
import {
  Brain,
  Bot,
  MessageCircle,
  Clock3,
  HeartHandshake,
  Video,
  Moon,
} from 'lucide-react'
import { Media } from '@/components/Media'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Feature = {
  id?: string
  icon: 'brain' | 'bot' | 'messageCircle' | 'clock' | 'heartHandshake' | 'video'
  label: string
}

type Props = {
  title: string
  features: Feature[]
  mockupImage: any
}

const iconMap = {
  brain: Brain,
  bot: Bot,
  messageCircle: MessageCircle,
  clock: Clock3,
  heartHandshake: HeartHandshake,
  video: Video,
}

export const TroisiemeBlocAccueilBlock: React.FC<Props> = ({
  title,
  features,
  mockupImage,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F8F3FF] px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.22),_transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#4B3F72] md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {features?.slice(0, 3).map((feature, index) => {
                const Icon = iconMap[feature.icon]

                return (
                  <div
                    key={feature.id || index}
                    className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E8FF]">
                      <Icon className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <span className="text-sm font-medium text-[#4B3F72] md:text-base">
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {features?.slice(3, 5).map((feature, index) => {
                const Icon = iconMap[feature.icon]

                return (
                  <div
                    key={feature.id || `middle-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E8FF]">
                      <Icon className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <span className="text-sm font-medium text-[#4B3F72] md:text-base">
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div>
              {features?.slice(5, 6).map((feature, index) => {
                const Icon = iconMap[feature.icon]

                return (
                  <div
                    key={feature.id || `last-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E8FF]">
                      <Icon className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <span className="text-sm font-medium text-[#4B3F72] md:text-base">
                      {feature.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <Card className="rounded-[36px] border-white/60 bg-white/75 p-5 shadow-[0_25px_70px_rgba(124,58,237,0.14)] backdrop-blur-md">
  <CardContent className="space-y-5 p-0">
    <div className="rounded-[28px] bg-gradient-to-br from-[#E8D9FF] via-[#EEE4FF] to-[#F8F3FF] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#7C5BA8]">Analyse du rêve</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#4B3F72]">
            Rêve 
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
          <Moon className="h-6 w-6 text-[#8B5CF6]" />
        </div>
      </div>

      <p className="mt-4 max-w-md text-sm leading-6 text-[#6E628F]">
        Votre rêve évoque un besoin d’apaisement, d’exploration intérieure
        et une recherche de clarté émotionnelle.
      </p>
    </div>

    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#6E628F]">Clarté émotionnelle</span>
          <span className="font-medium text-[#4B3F72]">82%</span>
        </div>
        <div className="h-3 rounded-full bg-[#EFE7FF]">
          <div className="h-3 w-[82%] rounded-full bg-[#B794F4]" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#6E628F]">Intensité symbolique</span>
          <span className="font-medium text-[#4B3F72]">67%</span>
        </div>
        <div className="h-3 rounded-full bg-[#EFE7FF]">
          <div className="h-3 w-[67%] rounded-full bg-[#C4A6FF]" />
        </div>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[#F7F2FF] p-4">
        <p className="text-xs uppercase tracking-wide text-[#8C78B0]">
          Symbole dominant
        </p>
        <p className="mt-2 text-base font-semibold text-[#4B3F72]">Lune</p>
      </div>

      <div className="rounded-2xl bg-[#F7F2FF] p-4">
        <p className="text-xs uppercase tracking-wide text-[#8C78B0]">
          État émotionnel
        </p>
        <p className="mt-2 text-base font-semibold text-[#4B3F72]">Apaisement</p>
      </div>
    </div>

    <div className="rounded-2xl bg-[#F3ECFF] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4B3F72]">
            Insight personnalisé
          </p>
          <p className="mt-1 text-sm text-[#6E628F]">
            Ce rêve suggère une phase de recentrage et d’écoute intérieure.
          </p>
        </div>

        <Button
          className="rounded-full bg-[#8B5CF6] px-5 text-white hover:bg-[#7C3AED]"
        >
          Explorer
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </section>
  )
}