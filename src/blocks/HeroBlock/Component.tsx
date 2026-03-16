import React from 'react'
import Link from 'next/link'
import { MoonStar, MessageCircleMore, Sparkles } from 'lucide-react'

type LandingHeroBlockProps = {
  title: string
  description: string
  primaryButton: {
    label: string
    href: string
  }
  mockupTitle?: string
  mockupMessage?: string
}

export default function LandingHeroBlockComponent(props: LandingHeroBlockProps) {
  const { title, description, primaryButton, mockupTitle, mockupMessage } = props

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f4ff] via-[#efe4ff] to-[#e6d7ff] px-6 pt-16 pb-24 md:px-10 lg:px-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,181,253,0.35),transparent_25%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.75),transparent_20%),radial-gradient(circle_at_70%_70%,rgba(233,213,255,0.4),transparent_25%)]" />
      <div className="absolute left-0 top-24 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight text-violet-950 md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 text-lg leading-9 text-violet-900/75">
            {description}
          </p>

          <div className="mt-10">
            <Link
              href={primaryButton.href}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition hover:from-violet-600 hover:to-fuchsia-500"
            >
              {primaryButton.label}
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[520px] items-center justify-center">
          <div className="absolute h-[380px] w-[380px] rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative z-20 w-[280px] rounded-[44px] border border-white/70 bg-white/60 p-[10px] shadow-[0_25px_70px_rgba(109,40,217,0.18)] backdrop-blur-xl">
            <div className="rounded-[36px] bg-gradient-to-b from-[#ceb4ff] via-[#eadcff] to-[#faf6ff] p-4">
              <div className="mb-4 flex justify-center">
                <div className="h-2.5 w-24 rounded-full bg-violet-400/35" />
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] bg-white/85 p-5 shadow-[0_8px_24px_rgba(109,40,217,0.08)]">
                  <div className="mb-3 flex items-center gap-2 text-violet-700">
                    <MoonStar className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {mockupTitle || 'Rêve Lucide'}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-violet-900/70">
                    Lune dorée, ciel onirique et sensation de calme intérieur.
                  </p>
                </div>

                <div className="rounded-[26px] bg-white/90 p-5 shadow-[0_8px_24px_rgba(109,40,217,0.08)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                      <MessageCircleMore className="h-5 w-5 text-violet-600" />
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-violet-800">Respirez</p>
                      <p className="mt-2 text-sm leading-7 text-violet-900/70">
                        {mockupMessage ||
                          'Décris ton rêve et je t’aiderai à repérer les émotions, symboles et motifs importants.'}
                      </p>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          <div className="absolute -left-8 top-12 h-24 w-24 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute bottom-6 right-0 h-28 w-28 rounded-full bg-pink-200/35 blur-3xl" />
        </div>
      </div>
    </section>
  )
}