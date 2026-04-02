'use client'

import { useState } from 'react'

const questions = [
  {
    question: 'Sous combien de temps vais-je recevoir une réponse ?',
    answer:
      'Nous répondons généralement sous 24 à 48 heures ouvrables selon le type de demande.',
  },
  {
    question: "Que faire si j'ai un problème avec une analyse ?",
    answer:
      "Sélectionnez le sujet lié à l'analyse IA dans le formulaire et décrivez le problème rencontré.",
  },
  {
    question: 'Comment demander un rendez-vous ?',
    answer:
      'Vous pouvez indiquer votre besoin dans le formulaire et préciser le type de suivi attendu.',
  },
  {
    question: 'Puis-je vous contacter pour un partenariat ?',
    answer:
      'Oui, vous pouvez choisir un sujet de demande lié au partenariat ou au contact général.',
  },
]

export function QuestionsContact() {
  const [ouverte, setOuverte] = useState(0)

  return (
    <section className="rounded-[32px] border border-white/60 bg-white/75 p-8 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
      <h2 className="text-4xl font-bold text-[#4d2d7b]">Questions fréquentes</h2>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-white/60 bg-white/70">
        {questions.map((item, index) => {
          const active = ouverte === index

          return (
            <div
              key={item.question}
              className={index !== questions.length - 1 ? 'border-b border-white/60' : ''}
            >
              <button
                type="button"
                onClick={() => setOuverte(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-2 block h-2.5 w-2.5 rounded-full bg-[#d7c0ff]" />
                  <span className="text-lg font-medium text-[#4d2d7b]">
                    {item.question}
                  </span>
                </div>

                <span className="text-2xl text-[#8d76b7]">
                  {active ? '−' : '+'}
                </span>
              </button>

              {active && (
                <div className="px-11 pb-5">
                  <p className="text-[16px] leading-7 text-[#7f6b9f]">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}