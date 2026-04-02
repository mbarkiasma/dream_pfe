// src/blocks/RoleCards/Component.tsx
import React from 'react'
import Link from 'next/link'

type Media = {
  url?: string | null
  alt?: string | null
}

type Card = {
  title: string
  description: string
  link: string
  icon?: Media | number | null
}

type Props = {
  title?: string
  subtitle?: string
  cards?: Card[]
}

export const RoleCardsBlock: React.FC<Props> = ({ title, subtitle, cards }) => {
  return (
    <section className="bg-[#f6f1ff] py-24">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          {title && (
            <h1 className="text-4xl font-bold text-[#2d1068] md:text-5xl">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#7a6a99]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards?.map((card, index) => {
            const media = typeof card.icon === 'object' && card.icon !== null ? card.icon : null

            return (
              <div
                key={index}
                className="rounded-[32px] border border-white/60 bg-white/80 p-8 text-center shadow-lg backdrop-blur"
              >
                <div className="mb-5 flex justify-center">
                  {media?.url ? (
                    <img
                      src={media.url}
                      alt={media.alt || card.title}
                      className="h-20 w-20 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#efe7ff] text-3xl shadow-md">
                      {card.title === 'Student' && '🎓'}
                      {card.title === 'Psychologue' && '🧠'}
                      {card.title === 'Coach' && '💼'}
                    </div>
                  )}
                </div>

                <h2 className="mb-3 text-2xl font-semibold text-[#2d1068]">
                  {card.title}
                </h2>

                <p className="mb-6 leading-7 text-[#7a6a99]">
                  {card.description}
                </p>

                <Link
                  href={card.link}
                  className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-medium text-white transition hover:scale-105"
                >
                  Continuer
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}