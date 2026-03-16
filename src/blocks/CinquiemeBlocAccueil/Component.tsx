import React from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
  id?: string
  name: string
  role: string
  review: string
  rating: number
}

type Props = {
  title: string
  testimonials: Testimonial[]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const CinquiemeBlocAccueilBlock: React.FC<Props> = ({
  title,
  testimonials,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F6F0FF] px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.18),_transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#4B3F72] md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials?.map((item, index) => (
            <Card
              key={item.id || index}
              className="group rounded-[28px] border border-white/60 bg-white/70 shadow-[0_12px_40px_rgba(170,150,230,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_24px_60px_rgba(124,58,237,0.20)]"
            >
              <CardContent className="p-6">
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D8C4FF] to-[#F2EBFF] text-lg font-semibold text-[#5B438A] shadow-[0_10px_20px_rgba(124,58,237,0.12)]">
                    {getInitials(item.name)}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-[#4B3F72]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#7A6B9F]">{item.role}</p>

                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${
                            starIndex < item.rating
                              ? 'fill-[#F6B44C] text-[#F6B44C]'
                              : 'text-[#E5D9FF]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-base leading-8 text-[#4B3F72]">
                  {item.review}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}