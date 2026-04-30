"use client"

import React, { JSX, useState } from "react"

import { Button } from "@/components/ui/button"

export interface CarouselItem {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  iconBg?: string
  softBg?: string
  bubble?: string
}

export interface CarouselProps {
  items?: CarouselItem[]
  baseWidth?: number
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
  loop?: boolean
  round?: boolean
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: "Journal de reves",
    description: "Gardez une trace claire de vos reves et de leurs analyses.",
    icon: "R",
  },
  {
    id: 2,
    title: "Accompagnement",
    description: "Retrouvez vos ressources et vos suivis au meme endroit.",
    icon: "A",
  },
  {
    id: 3,
    title: "Progression",
    description: "Suivez vos habitudes, vos objectifs et vos moments importants.",
    icon: "P",
  },
]

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  round = false,
}: CarouselProps): JSX.Element {
  const [position, setPosition] = useState(0)
  const currentItem = items[position] ?? items[0]

  return (
    <div
      className={`dream-card-glass relative overflow-hidden p-4 ${
        round ? "rounded-full" : "rounded-[32px]"
      }`}
      style={{ width: `${baseWidth + 22}px` }}
    >
      <div className="dream-surface relative overflow-hidden rounded-[28px] border">
        <div className="dream-icon-soft m-6 mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold">
          <span>{currentItem.icon}</span>
        </div>

        <div className="p-6 pt-0">
          <h3 className="text-2xl font-semibold text-dream-heading">{currentItem.title}</h3>
          <p className="mt-4 text-[15px] leading-7 text-dream-muted">
            {currentItem.description}
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-dream-accent">
            <span>Decouvrir</span>
            <span aria-hidden="true">-&gt;</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        {items.map((item, index) => (
          <Button
            aria-label={`Afficher ${item.title}`}
            key={item.id}
            onClick={() => setPosition(index)}
            size="iconSm"
            type="button"
            variant={position === index ? "dream" : "dreamSoft"}
            className="h-2 w-2 rounded-full p-0"
          />
        ))}
      </div>
    </div>
  )
}
