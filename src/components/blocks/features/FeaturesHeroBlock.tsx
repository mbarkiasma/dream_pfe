'use client'

import Link from 'next/link'
import {
  Building2,
  Heart,
  Sparkles,
  Shield,
  MessageCircle,
  Mic,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import SplitText from '@/components/blocks/accompagnement/SplitText'
import {
  appBadgeCtaSecondaryClass,
  sectionBadgeClass,
  sectionBadgeDotClass,
} from '@/components/ui/badge'

export default function FeaturesHeroBlock() {
  const { lang } = useLanguage()
  const isFr = lang === 'fr'

  const quickBadges = isFr
    ? [
        { label: 'ESSTHS · Sousse', Icon: Building2 },
        { label: '100% gratuit', Icon: Heart },
        { label: 'IA intégrée', Icon: Sparkles },
      ]
    : [
        { label: 'ESSTHS · Sousse', Icon: Building2 },
        { label: '100% free', Icon: Heart },
        { label: 'AI integrated', Icon: Sparkles },
      ]

  const handleTitleAnimationComplete = () => {
    console.log('All letters have animated!')
  }

  const splitProps = {
    delay: 18,
    duration: 0.65,
    ease: 'power3.out',
    splitType: 'chars' as const,
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    threshold: 0.1,
    rootMargin: '-100px',
    textAlign: 'left' as const,
  }

  return (
    <section className="relative overflow-hidden bg-transparent px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_16%_20%,rgba(137,94,248,0.10),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(137,94,248,0.10),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(169,135,255,0.08),transparent_30%)]" />

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-start gap-10 lg:grid-cols-[minmax(0,540px)_minmax(560px,1fr)] xl:gap-12">
        <div className="pt-2 lg:pt-0">
          <div className={`mb-5 ${sectionBadgeClass}`}>
            <span className={sectionBadgeDotClass} />
            {isFr ? 'Solution de bien-être étudiant' : 'Student well-being solution'}
          </div>

          <h1 className="max-w-[620px] font-[var(--font-poppins)] text-[34px] font-bold leading-[1.12] tracking-normal text-[var(--mindly-text-strong)] sm:text-[40px] lg:text-[44px] xl:text-[48px]">
            {isFr ? (
              <>
                <span className="block whitespace-nowrap">
                  <SplitText
                    text="MindBloom"
                    className="inline-block bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text pb-2 text-transparent"
                    {...splitProps}
                  />
                  <SplitText
                    text=", la plateforme qui"
                    className="inline-block"
                    {...splitProps}
                  />
                </span>
                <SplitText
                  text="transforme l'écoute"
                  className="block whitespace-nowrap"
                  onLetterAnimationComplete={handleTitleAnimationComplete}
                  showCallback
                  {...splitProps}
                />
                <SplitText
                  text="en accompagnement"
                  className="block whitespace-nowrap"
                  {...splitProps}
                />
              </>
            ) : (
              <>
                <span className="block">
                  <SplitText
                    text="MindBloom"
                    className="inline-block bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text pb-2 text-transparent"
                    {...splitProps}
                  />
                  <SplitText text=", a listening space" className="inline-block" {...splitProps} />
                </span>
                <SplitText
                  text="for students."
                  className="block"
                  onLetterAnimationComplete={handleTitleAnimationComplete}
                  showCallback
                  {...splitProps}
                />
              </>
            )}
          </h1>

          <p className="mt-4 font-[family-name:var(--font-zain)] text-[18px] font-bold tracking-normal text-[var(--mindly-purple-muted)] sm:text-[20px]">
            {isFr ? 'Un espace pour parler et avancer.' : 'A space to talk and move forward.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 lg:mt-5">
            {quickBadges.map(({ label, Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--mindly-lavender-350)] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[var(--mindly-primary)] shadow-[0_8px_20px_rgba(137,94,248,0.07)]"
              >
                <Icon className="h-4 w-4 text-[var(--mindly-primary)]" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-6 max-w-[640px]">
            <p className="font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)]">
              {isFr ? (
                <>
                  Parce que la réussite commence par aller bien. Notre plateforme t&apos;accompagne chaque
                  jour : un espace sûr où parler librement, comprendre tes émotions et avancer avec le
                  soutien humain et IA qu&apos;il te faut.
                </>
              ) : (
                <>
                  Because success begins with feeling well. Our platform supports you every day: a safe
                  space to speak freely, understand your emotions and move forward with the human and AI
                  support you need.
                </>
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-11 min-w-[210px] items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#895ef8,#a987ff)] px-5 py-2.5 text-[14px] font-bold text-[var(--mindly-white)] shadow-[0_12px_28px_rgba(137,94,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(137,94,248,0.30)] active:scale-[0.98]"
            >
              {isFr ? 'Contactez-nous' : 'Contact us'}
            </Link>

            <Link
              href="/a-propos"
              className={`${appBadgeCtaSecondaryClass} !min-h-11 !min-w-[210px] px-5 py-2.5 text-[14px]`}
            >
              {isFr ? 'À propos de nous' : 'About us'}
            </Link>
          </div>
        </div>

        <div className="relative lg:translate-y-4">
          <div className="grid gap-3 lg:gap-4">
            <article className="overflow-hidden rounded-[24px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] shadow-[0_20px_45px_rgba(137,94,248,0.12)]">
              <div className="relative h-[190px] overflow-hidden bg-[var(--mindly-bg-strong)] sm:h-[210px] lg:h-[230px]">
                <video
                  className="h-full w-full object-cover"
                  src="/videos/video_reve_front.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={isFr ? 'Vidéo illustrée du rêve du 28 avril' : 'Illustrated dream video from Apr 28'}
                />
                <div className="pointer-events-none absolute inset-0 bg-[image:var(--mindly-video-overlay)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(169,135,255,0.18),transparent_26%)]" />
                <div className="absolute left-6 top-5 rounded-full border border-transparent bg-[image:var(--mindly-gradient-primary)] px-4 py-2 text-[12px] font-bold text-white shadow-[var(--mindly-shadow-sm)] backdrop-blur-md">
                  {isFr ? 'Rêve du 28 Avr' : 'Dream of Apr 28'}
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 text-[11px] font-semibold text-white/80">
                  <span>0:00</span>
                  <div className="h-[3px] flex-1 rounded-full bg-[var(--mindly-video-progress-bg)] shadow-[0_0_18px_rgba(169,135,255,0.18)]">
                    <div className="h-full w-[80%] rounded-full bg-[var(--mindly-video-progress-fill)]" />
                  </div>
                  <span>3:42</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <div>
                  <h3 className="font-[var(--font-poppins)] text-[16px] font-bold text-[var(--mindly-text-strong)]">
                    {isFr ? 'Journal de rêves' : 'Dream journal'}
                  </h3>
                  <p className="mt-1 text-[12px] font-medium text-[var(--mindly-purple-muted)]">
                    {isFr
                      ? 'Vidéo illustrée générée par IA · Résumé de votre nuit'
                      : 'AI-generated illustrated video · Summary of your night'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mindly-lavender-600)] bg-[var(--mindly-bg)] px-3 py-1 text-[11.5px] font-bold text-[var(--mindly-primary)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isFr ? 'Vidéo IA' : 'AI video'}
                  </span>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article className="flex min-h-[132px] flex-col rounded-[20px] border border-[var(--mindly-lavender-600)] bg-[linear-gradient(90deg,#895ef8,#a987ff)] p-3.5 text-white shadow-[0_12px_26px_rgba(137,94,248,0.22)]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/14">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="font-[var(--font-poppins)] text-[14px] font-bold leading-tight text-white">
                  {isFr ? 'ESSTHS · Sousse' : 'ESSTHS · Sousse'}
                </h3>
                <p className="mt-2 text-[12px] font-medium leading-5 text-white/90">
                  {isFr
                    ? '100% chiffrées, jamais partagées. Votre confidentialité avant tout.'
                    : '100% encrypted, never shared. Your privacy first.'}
                </p>
                <span className="mt-auto inline-flex w-fit rounded-full border border-white/40 bg-white/12 px-3 py-1 text-[11.5px] font-semibold">
                  {isFr ? 'Privé' : 'Private'}
                </span>
              </article>

              <article className="flex min-h-[132px] flex-col rounded-[20px] border border-[var(--mindly-border)] bg-white p-3.5 shadow-[0_12px_26px_rgba(137,94,248,0.08)]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[12px] bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <h3 className="font-[var(--font-poppins)] text-[14px] font-bold leading-tight text-[var(--mindly-text-strong)]">
                  {isFr ? '100% gratuit' : '100% free'}
                </h3>
                <p className="mt-2 text-[12px] font-medium leading-5 text-[var(--mindly-purple-muted)]">
                  {isFr ? 'Humain ou IA, toujours disponible.' : 'Human or AI, always available.'}
                </p>
                <span className="mt-auto inline-flex w-fit rounded-full border border-[var(--mindly-lavender-600)] bg-white px-3 py-1 text-[11.5px] font-semibold text-[var(--mindly-primary)]">
                  {isFr ? 'Pour étudiant' : 'For students'}
                </span>
              </article>

              <article className="flex min-h-[132px] flex-col rounded-[20px] border border-[var(--mindly-lavender-500)] bg-[var(--mindly-lavender-50)] p-3.5 shadow-[0_12px_26px_rgba(137,94,248,0.06)]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[12px] bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)]">
                  <Mic className="h-4 w-4" />
                </div>
                <h3 className="font-[var(--font-poppins)] text-[14px] font-bold leading-tight text-[var(--mindly-text-strong)]">
                  {isFr ? 'IA intégrée' : 'AI integrated'}
                </h3>
                <p className="mt-2 text-[12px] font-medium leading-5 text-[var(--mindly-purple-muted)]">
                  {isFr
                    ? 'Un échange guidé pour mieux comprendre votre état émotionnel.'
                    : 'A guided conversation to better understand your emotional state.'}
                </p>
                <span className="mt-auto inline-flex w-fit rounded-full border border-[var(--mindly-lavender-600)] bg-white px-3 py-1 text-[11.5px] font-semibold text-[var(--mindly-primary)]">
                  {isFr ? 'Analyse vocale' : 'Voice analysis'}
                </span>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

