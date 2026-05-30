'use client'

import { Link } from '@/i18n/routing'
import {
  Building2,
  Heart,
  Sparkles,
  Shield,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import SplitText from '@/components/blocks/accompagnement/SplitText'
import {
  appBadgeCtaSecondaryClass,
  sectionBadgeClass,
  sectionBadgeDotClass,
} from '@/components/ui/badge'

export default function FeaturesHeroBlock() {
  const t = useTranslations('featuresPage.hero')

  const quickBadges = t.raw('quickBadges') as Array<{ icon: string; label: string }>
  const cards = t.raw('cards') as Array<{ title: string; desc: string; badge: string }>

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

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,600px)] lg:gap-14 xl:gap-16">
        <div className="pt-2 lg:pt-0">
          <div className={`mb-5 ${sectionBadgeClass}`}>
            <span className={sectionBadgeDotClass} />
            {t('sectionBadge')}
          </div>

          <h1 className="max-w-[660px] font-[var(--font-poppins)] text-[34px] font-bold leading-[1.12] tracking-normal text-[var(--mindly-text-strong)] sm:text-[40px] lg:text-[42px] xl:text-[46px]">
            <span className="block">
              <SplitText
                text="MindBloom"
                className="inline-block bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text pb-2 text-transparent"
                {...splitProps}
              />
              <SplitText text={t('titleLine1B')} className="inline-block" {...splitProps} />
            </span>
            <SplitText
              text={t('titleLine2')}
              className="block"
              onLetterAnimationComplete={handleTitleAnimationComplete}
              showCallback
              {...splitProps}
            />
            <SplitText text={t('titleLine3')} className="block" {...splitProps} />
          </h1>

          <p className="mt-4 font-[family-name:var(--font-zain)] text-[18px] font-bold tracking-normal text-[var(--mindly-purple-muted)] sm:text-[20px]">
            {t('subtitle')}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 lg:mt-5">
            {quickBadges.map(({ icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--mindly-lavender-350)] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[var(--mindly-primary)] shadow-[0_8px_20px_rgba(137,94,248,0.07)]"
              >
                {icon === 'building2' && <Building2 className="h-4 w-4 text-[var(--mindly-primary)]" />}
                {icon === 'heart' && <Heart className="h-4 w-4 text-[var(--mindly-primary)]" />}
                {icon === 'sparkles' && <Sparkles className="h-4 w-4 text-[var(--mindly-primary)]" />}
                {label}
              </div>
            ))}
          </div>

          <div className="mt-6 max-w-[640px]">
            <p className="font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)]">
              {t('paragraph')}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
            <Link
              href="/contact"
              className="flex min-h-11 w-full items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#895ef8,#a987ff)] px-3 py-2.5 text-center text-[13px] font-bold text-[var(--mindly-white)] shadow-[0_12px_28px_rgba(137,94,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(137,94,248,0.30)] active:scale-[0.98] sm:w-auto sm:min-w-[190px] sm:px-5 sm:text-[14px]"
            >
              {t('contactButton')}
            </Link>

            <Link
              href="/a-propos"
              className={`${appBadgeCtaSecondaryClass} !min-h-11 !min-w-0 !whitespace-nowrap !text-[13px] !px-3 !py-2.5 w-full text-center sm:w-auto sm:!text-[14px] sm:!px-5 sm:!min-w-[190px]`}
            >
              {t('aboutButton')}
            </Link>
          </div>
        </div>

        <div className="relative lg:max-w-[600px] lg:translate-y-4 lg:justify-self-end">
          <div className="grid gap-3 lg:gap-4">
            <article className="overflow-hidden rounded-[24px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] shadow-[0_20px_45px_rgba(137,94,248,0.12)]">
              <div className="relative h-[180px] overflow-hidden bg-[var(--mindly-bg-strong)] sm:h-[200px] lg:h-[210px]">
                <video
                  className="h-full w-full object-cover"
                  src="/videos/video_reve_front.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={t('videoAria')}
                />
                <div className="pointer-events-none absolute inset-0 bg-[image:var(--mindly-video-overlay)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(169,135,255,0.18),transparent_26%)]" />
                <div className="absolute left-6 top-5 rounded-full border border-transparent bg-[image:var(--mindly-gradient-primary)] px-4 py-2 text-[12px] font-bold text-white shadow-[var(--mindly-shadow-sm)] backdrop-blur-md">
                  {t('dreamLabel')}
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
                    {t('journalTitle')}
                  </h3>
                  <p className="mt-1 text-[12px] font-medium text-[var(--mindly-purple-muted)]">
                    {t('journalDesc')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--mindly-lavender-600)] bg-[var(--mindly-bg)] px-3 py-1 text-[11.5px] font-bold text-[var(--mindly-primary)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('videoBadge')}
                  </span>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map(({ title, desc, badge }) => (
                <article
                  key={title}
                  className="group flex min-h-[132px] flex-col rounded-[20px] border border-[var(--mindly-border)] bg-white p-3.5 shadow-[0_12px_26px_rgba(137,94,248,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--mindly-lavender-350)] hover:shadow-[0_20px_44px_rgba(137,94,248,0.18)]"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[12px] bg-[var(--mindly-bg-strong)] text-[var(--mindly-primary)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--mindly-lavender-350)]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="font-[var(--font-poppins)] text-[14px] font-bold leading-tight text-[var(--mindly-text-strong)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[12px] font-medium leading-5 text-[var(--mindly-purple-muted)]">
                    {desc}
                  </p>
                  <span className="mt-auto inline-flex w-fit rounded-full border border-[var(--mindly-lavender-600)] bg-white px-3 py-1 text-[11.5px] font-semibold text-[var(--mindly-primary)] transition-all duration-300 group-hover:bg-[var(--mindly-bg-strong)]">
                    {badge}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

