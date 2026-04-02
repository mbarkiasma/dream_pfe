export function FormulaireContact() {
  return (
    <section
      id="formulaire-contact"
      className="rounded-[32px] border border-white/60 bg-white/75 p-8 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]"
    >
      <h2 className="text-4xl font-bold text-[#4d2d7b]">Envoyez-nous un message</h2>

      <form className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Nom complet"
          className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none placeholder:text-[#a290bf]"
        />

        <input
          type="email"
          placeholder="Email"
          className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none placeholder:text-[#a290bf]"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Téléphone"
            className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none placeholder:text-[#a290bf]"
          />

          <select className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none">
            <option>Étudiant</option>
            <option>Psychologue</option>
            <option>Coach</option>
            <option>Support</option>
          </select>

          <select className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none">
            <option>Priorité normale</option>
            <option>Priorité haute</option>
            <option>Urgent</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none">
            <option>Type de demande</option>
            <option>Journal de rêves</option>
            <option>Analyse IA</option>
            <option>Séances</option>
            <option>Rapports</option>
            <option>Support technique</option>
          </select>

          <input
            type="text"
            placeholder="Sujet"
            className="h-14 w-full rounded-2xl border border-white/60 bg-white/88 px-4 text-[#4d2d7b] outline-none placeholder:text-[#a290bf]"
          />
        </div>

        <textarea
          placeholder="Décrivez votre demande..."
          className="min-h-[170px] w-full rounded-2xl border border-white/60 bg-white/88 px-4 py-4 text-[#4d2d7b] outline-none placeholder:text-[#a290bf]"
        />

        <div className="pt-2 text-center">
          <button
            type="submit"
            className="inline-flex min-w-[240px] items-center justify-center rounded-full bg-gradient-to-r from-[#e1a7d9] via-[#b79ef6] to-[#8c90ff] px-8 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(140,144,255,0.28)] transition hover:scale-[1.02]"
          >
            Envoyer la demande
          </button>
        </div>
      </form>
    </section>
  )
}