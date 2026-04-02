const etapes = [
  'Votre profil et votre besoin sont identifiés.',
  'La demande est orientée vers le bon pôle.',
  'Le niveau de priorité est pris en compte.',
  'Vous recevez une réponse adaptée.',
]

const couleurs = ['bg-[#efbfd7]', 'bg-[#d7c0ff]', 'bg-[#b79ef6]', 'bg-[#f6c59f]']

export function ProcessusContact() {
  return (
    <section className="rounded-[30px] border border-white/60 bg-white/75 p-8 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
      <h2 className="text-4xl font-bold text-[#4d2d7b]">Envoyez-nous un message</h2>

      <div className="mt-8 space-y-6">
        {etapes.map((etape, index) => (
          <div key={etape} className="flex items-start gap-4">
            <span
              className={`mt-2 block h-3.5 w-3.5 rounded-full ${couleurs[index]}`}
            />
            <p className="text-lg leading-8 text-[#6f5f97]">
              <span className="font-semibold text-[#4d2d7b]">{index + 1}.</span>{' '}
              {etape}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}