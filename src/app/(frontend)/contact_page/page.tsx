import { HeroContact } from '@/components/contact/HeroContact'
import { BesoinsContact } from '@/components/contact/BesoinsContact'
import { CanauxContact } from '@/components/contact/CanauxContact'
import { ProcessusContact } from '@/components/contact/ProcessusContact'
import { FormulaireContact } from '@/components/contact/FormulaireContact'
import { QuestionsContact } from '@/components/contact/QuestionsContact'
import { ConfianceContact } from '@/components/contact/ConfianceContact'

export default function PageContact() {
  return (
    <main className="relative overflow-hidden bg-[#f6effb]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,rgba(224,196,248,0.45),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(196,179,255,0.35),transparent_26%),radial-gradient(circle_at_70%_78%,rgba(236,200,245,0.28),transparent_24%),linear-gradient(180deg,#f8f3fc_0%,#f3ebfb_100%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="anim-float-soft anim-glow-soft absolute -top-10 left-[6%] h-56 w-56 rounded-full bg-white/35 blur-3xl" />
        <div className="anim-float-soft-slow absolute top-[10%] right-[8%] h-72 w-72 rounded-full bg-[#ead7ff]/35 blur-3xl" />
        <div className="anim-float-soft absolute top-[38%] left-[12%] h-44 w-44 rounded-full bg-[#f5d9ea]/30 blur-3xl" />
        <div className="anim-float-soft-slow anim-glow-soft absolute bottom-[18%] right-[10%] h-64 w-64 rounded-full bg-[#d9d5ff]/30 blur-3xl" />
        <div className="absolute left-1/2 top-[22%] h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute left-1/2 top-[58%] h-px w-[74%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      <HeroContact />
      <BesoinsContact />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-2">
        <CanauxContact />
        <ProcessusContact />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <FormulaireContact />
        <QuestionsContact />
      </section>

      <ConfianceContact />
    </main>
  )
}