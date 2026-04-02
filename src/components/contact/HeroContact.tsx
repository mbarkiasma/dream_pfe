export function HeroContact() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute top-16 left-32 h-24 w-24 rounded-full bg-[#ead7ff]/40 blur-2xl" />

          <div className="relative">
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] text-[#4d2d7b] md:text-6xl">
              Parlons de votre
              <br />
              expérience Dream
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#7f6b9f]">
              Une question sur votre espace, vos séances, vos analyses IA ou votre
              suivi ? Nous vous orientons vers le bon interlocuteur.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#formulaire-contact"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#e1a7d9] via-[#b79ef6] to-[#8c90ff] px-8 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(140,144,255,0.28)] transition hover:scale-[1.02]"
              >
                Nous écrire
              </a>

              <a
                href="#canaux-contact"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(180,162,226,0.35)] bg-white/80 px-8 py-3 font-semibold text-[#5c3b88] transition hover:bg-white"
              >
                Voir les canaux
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/60 bg-white/75 p-6 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
          <div className="rounded-[26px] border border-white/60 bg-white/70 p-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#efbfd7] to-[#b79ef6] text-2xl text-white shadow-md">
                ♡
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-[#4d2d7b]">
                  Réponse rapide
                </h2>
                <p className="mt-1 text-[#7f6b9f]">et orientation ciblée</p>
              </div>
            </div>

            <div className="space-y-4 text-[#5a4386]">
              <div className="flex items-start gap-3 border-b border-white/60 pb-3">
                <span className="mt-1 text-[#b08ae9]">•</span>
                <p>
                  <span className="font-bold">24h</span> &nbsp; Temps moyen de réponse
                </p>
              </div>

              <div className="flex items-start gap-3 border-b border-white/60 pb-3">
                <span className="mt-1 text-[#b08ae9]">•</span>
                <p>Étudiant, Psychologue, Coach, Support</p>
              </div>

              <div className="flex items-start gap-3 border-b border-white/60 pb-3">
                <span className="mt-1 text-[#b08ae9]">•</span>
                <p>Lundi au vendredi, 9h – 18h</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 text-[#e1a7d9]">•</span>
                <p>Séances, suivi, accès, rapports, urgence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}