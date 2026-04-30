import React from 'react'
import { BookOpen, Bot, Quote, Star, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Step = {
  id?: string
  icon: 'userPlus' | 'bot' | 'bookOpen'
  title: string
  description: string
}

type Props = {
  title: string
  steps: Step[]
  testimonialName: string
  testimonialRole: string
  testimonialText: string
  rating: number
}

const iconMap = {
  userPlus: UserPlus,
  bot: Bot,
  bookOpen: BookOpen,
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const QuatriemeBlocAccueilBlock: React.FC<Props> = ({
  title,
  steps,
  testimonialName,
  testimonialRole,
  testimonialText,
  rating,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F6F0FF] px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.20),_transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#4B3F72] md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="mb-10 grid gap-5 md:grid-cols-3">
          {steps?.map((step, index) => {
            const Icon = iconMap[step.icon]

            return (
              <Card
                key={step.id || index}
                className="group rounded-[28px] border border-border bg-card/75 shadow-[0_12px_40px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card/90 hover:shadow-[0_22px_60px_rgba(124,58,237,0.20)]"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F1E8FF] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#EBDDFF]">
                    <Icon className="h-7 w-7 text-[#8B5CF6]" />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-[#4B3F72]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-7 text-dream-muted md:text-base">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="rounded-[36px] border border-border bg-white/50 shadow-[0_18px_50px_rgba(170,150,230,0.14)] backdrop-blur-md">
          <CardContent className="p-6 md:p-10">
            <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-28 w-28 border-4 border-white shadow-[0_10px_30px_rgba(124,58,237,0.12)]">
                  <AvatarFallback className="bg-gradient-to-br from-[#D8C4FF] to-[#F2EBFF] text-2xl font-semibold text-[#5B438A]">
                    {getInitials(testimonialName)}
                  </AvatarFallback>
                </Avatar>

                <h4 className="mt-4 text-2xl font-semibold text-[#4B3F72]">
                  {testimonialName}
                </h4>
                <p className="mt-1 text-sm text-[#7A6B9F]">{testimonialRole}</p>
              </div>

              <div>
                <Quote className="mb-4 h-10 w-10 text-[#A78BFA]" />
                <blockquote className="text-2xl font-medium leading-relaxed text-[#4B3F72] md:text-4xl">
                  “ {testimonialText} ”
                </blockquote>

                <div className="mt-6 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < rating
                          ? 'fill-[#F6B44C] text-[#F6B44C]'
                          : 'text-[#E5D9FF]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}