'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const questions = [
  {
    value: 'item-1',
    question: 'Sous combien de temps vais-je recevoir une réponse ?',
    answer:
      'Nous répondons généralement sous 24 à 48 heures ouvrables selon le type de demande.',
  },
  {
    value: 'item-2',
    question: "Que faire si j'ai un problème avec une analyse ?",
    answer:
      "Sélectionnez le sujet lié à l'analyse IA dans le formulaire et décrivez le problème rencontré.",
  },
  {
    value: 'item-3',
    question: 'Comment demander un rendez-vous ?',
    answer:
      'Vous pouvez indiquer votre besoin dans le formulaire et préciser le type de suivi attendu.',
  },
  {
    value: 'item-4',
    question: 'Puis-je vous contacter pour un partenariat ?',
    answer:
      'Oui, vous pouvez choisir un sujet de demande lié au partenariat ou au contact général.',
  },
]

export function QuestionsContact() {
  return (
    <Card
      className="card-hover-premium rounded-[32px] border border-border bg-card/75 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]"
      style={{
        animation: 'fadeUpSoft 0.85s ease-out 0.2s both',
      }}
    >
      <CardContent className="p-8">
        <h2 className="text-4xl font-bold text-dream-heading">Questions fréquentes</h2>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-border bg-card/70">
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            {questions.map((item, index) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-border px-6"
                style={{
                  animation: 'fadeUpSoft 0.7s ease-out both',
                  animationDelay: `${0.28 + index * 0.08}s`,
                }}
              >
                <AccordionTrigger className="group py-5 text-left text-lg font-medium text-dream-heading hover:no-underline">
                  <div className="flex items-start gap-3">
                    <span className="mt-2 block h-2.5 w-2.5 rounded-full bg-[#d7c0ff] transition duration-300 group-hover:scale-125 group-hover:bg-[#b79ef6]" />
                    <span className="transition duration-300 group-hover:translate-x-1">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-5 pl-5 pr-2 text-[16px] leading-7 text-dream-muted">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}