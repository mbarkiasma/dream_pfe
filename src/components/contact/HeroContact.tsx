import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import ShinyText from '@/components/ShinyText'
import BorderGlow from '../BorderGlow'

export function HeroContact() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <div className="anim-float-soft anim-glow-soft absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
          <div className="anim-float-soft-slow absolute top-16 left-32 h-24 w-24 rounded-full bg-[#ead7ff]/40 blur-2xl" />

          <div className="relative">
            <h1 className="anim-fade-up max-w-3xl text-5xl font-bold leading-[1.08] text-[#4d2d7b] md:text-6xl">
              <ShinyText
                text="Parlons de votre"
                duration={4}
                color="#4d2d7b"
                shimmeringColor="#ebb1dc"
              />
              <br />
              <ShinyText
                text="expérience"
                duration={4}
                color="#4d2d7b"
                shimmeringColor="#ebb1dc"
              />
            </h1>

            <p className="anim-fade-up-delay-1 mt-6 max-w-2xl text-lg leading-8 text-[#7f6b9f]">
              Une question sur votre espace, vos séances, vos analyses IA ou votre
              suivi ? Nous vous orientons vers le bon interlocuteur.
            </p>

            <div className="anim-fade-up-delay-2 mt-8 flex flex-wrap gap-4">
              <a href="#formulaire-contact">
                <Button
                  variant="default"
                  size="lg"
                  className="anim-pulse-button h-12 rounded-full bg-gradient-to-r from-[#e1a7d9] via-[#b79ef6] to-[#8c90ff] px-8 font-semibold text-white shadow-[0_10px_30px_rgba(140,144,255,0.28)] transition duration-300 hover:scale-[1.03]"
                >
                  Nous écrire
                </Button>
              </a>

              <a href="#canaux-contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-[rgba(180,162,226,0.35)] bg-white/80 px-8 font-semibold text-[#5c3b88] transition duration-300 hover:scale-[1.03] hover:bg-white"
                >
                  Voir les canaux
                </Button>
              </a>
            </div>
          </div>
        </div>

        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#dd93cb"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <Card className="anim-fade-up-delay-3 card-hover-premium shimmer-wrap rounded-[30px] border border-white/60 bg-white/75 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]">
            <CardContent className="p-6">
              <div className="rounded-[26px] border border-white/60 bg-white/70 p-6">
                <div className="mb-5 flex items-start gap-4">
                  <div className="anim-float-soft flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#efbfd7] to-[#b79ef6] text-2xl text-white shadow-md">
                    ♡
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[#4d2d7b]">
                      Réponse rapide
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 text-[#5a4386]">
                  <div className="flex items-start gap-3 border-b border-white/60 pb-3 transition duration-300 hover:translate-x-1">
                    <span className="mt-1 text-[#b08ae9]">•</span>
                    <p>
                      <span className="font-bold">24h</span> &nbsp; Temps moyen de réponse
                    </p>
                  </div>

                  <div className="flex items-start gap-3 border-b border-white/60 pb-3 transition duration-300 hover:translate-x-1">
                    <span className="mt-1 text-[#b08ae9]">•</span>
                    <p>Étudiant, Psychologue, Coach, Support</p>
                  </div>

                  <div className="flex items-start gap-3 transition duration-300 hover:translate-x-1">
                    <span className="mt-1 text-[#e1a7d9]">•</span>
                    <p>Séances, suivi, accès, rapports, urgence.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </BorderGlow>
      </div>
    </section>
  )
}