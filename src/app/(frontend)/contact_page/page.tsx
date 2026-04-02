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
      <HeroContact />

      <BesoinsContact />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-2">
        <CanauxContact />
        <ProcessusContact />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FormulaireContact />
        <QuestionsContact />
      </section>

      <ConfianceContact />
    </main>
  )
}