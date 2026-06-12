'use client'

import { Link } from '@/i18n/routing'
import { BlurFade } from '@/components/ui/blur-fade'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import {
  AppBadge,
  appBadgeCtaClass,
  appBadgeCtaSecondaryClass,
  sectionBadgeClass,
  sectionBadgeDotClass,
} from '@/components/ui/badge'
import {
  BrainCircuit,
  Building2,
  Heart,
  Handshake,
  Mic,
  MoonStar,
  Play,
  Sparkles,
  ClipboardList,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

const NODE_SIZE = 120

export default function AccompagnementHeroBlock() {
  const t = useTranslations('homePage.hero')

  const quickBadges = t.raw('quickBadges') as Array<{ icon: string; label: string }>
  const nodes = t.raw('nodes') as Array<{
    icon: string
    title: string
    subtitle: string
    badge?: string
  }>

  const renderNodeIcon = (icon: string) => (
    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(90deg,#895ef8,#a987ff)] shadow-[0_10px_22px_rgba(137,94,248,0.24)]">
      {icon === 'mic' && <Mic className="h-[22px] w-[22px] text-white" />}
      {icon === 'clipboard' && <ClipboardList className="h-[22px] w-[22px] text-white" />}
      {icon === 'heart' && <Heart className="h-[22px] w-[22px] text-white" />}
      {icon === 'play' && <Play className="h-[22px] w-[22px] text-white" />}
      {icon === 'handshake' && <Handshake className="h-[22px] w-[22px] text-white" />}
      {icon === 'moon' && <MoonStar className="h-[22px] w-[22px] text-white" />}
    </div>
  )

  const renderNode = (node: (typeof nodes)[number], index: number) => (
    <div key={index} className="relative h-full w-full">
      {node.badge && (
        <div className="absolute -right-2 -top-2 z-10 rounded-full bg-[var(--mindly-primary)] px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_8px_18px_rgba(137,94,248,0.25)]">
          {node.badge}
        </div>
      )}

      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full border border-[var(--mindly-primary-soft)] bg-[var(--mindly-primary-soft-3)] px-2 text-center shadow-[0_14px_35px_rgba(137,94,248,0.14)]">
        {renderNodeIcon(node.icon)}

        <p className="w-full max-w-[94px] font-[family-name:var(--font-zain)] text-[12px] font-semibold leading-[1.2] text-[var(--mindly-text-strong)]">
          {node.title}
        </p>

        <p className="mt-1 w-full max-w-[94px] font-[family-name:var(--font-zain)] text-[10.5px] font-normal leading-tight text-[var(--mindly-purple-muted)]">
          {node.subtitle}
        </p>
      </div>
    </div>
  )

  return (
    <section className="relative w-full overflow-hidden bg-transparent px-5 pb-10 pt-10 font-[family-name:var(--font-zain)] sm:pt-12 lg:pt-14">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_24%_20%,rgba(137,94,248,0.08),transparent_34%),radial-gradient(circle_at_82%_48%,rgba(137,94,248,0.10),transparent_36%)]" />

      <div className="relative z-10 mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,690px)_minmax(430px,1fr)] lg:items-center lg:gap-8 xl:gap-10">
        {/* Texte à gauche */}
        <div className="order-1 min-w-0 w-full max-w-[760px]">
          <BlurFade delay={0.15} inView>
            <AppBadge dot dotClassName={sectionBadgeDotClass} className={sectionBadgeClass}>
              {t('badge')}
            </AppBadge>
          </BlurFade>

          <BlurFade delay={0.25} inView>
            <h1 className="mt-6 max-w-[760px] font-[family-name:var(--font-zain)] text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px] md:text-[46px] lg:text-[50px] xl:text-[54px]">
              <span className="block">
                <span className="inline-block pb-[0.08em] bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text text-transparent">
                  MindBloom
                </span>
                {t('titlePrefixLine1')}
              </span>

              <span className="block">{t('titlePrefixLine2')}</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="mt-4 font-[family-name:var(--font-zain)] text-[18px] font-bold tracking-normal text-[var(--mindly-purple-muted)] sm:text-[20px]">
              {t('subtitle')}
            </p>
          </BlurFade>

          <BlurFade delay={0.35} inView>
            <div className="mt-5 pb-1">
              <div className="flex flex-wrap gap-3">
                {quickBadges.map(({ icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--mindly-border)] bg-white px-4 py-2.5 font-[family-name:var(--font-zain)] text-[14px] font-normal tracking-normal text-[var(--mindly-primary)] shadow-[0_8px_20px_rgba(137,94,248,0.07)]"
                  >
                    {icon === 'building2' && <Building2 className="h-4 w-4 text-[var(--mindly-primary)]" />}
                    {icon === 'heart' && <Heart className="h-4 w-4 text-[var(--mindly-primary)]" />}
                    {icon === 'sparkles' && <Sparkles className="h-4 w-4 text-[var(--mindly-primary)]" />}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.45} inView>
            <p className="mt-6 max-w-[700px] font-[family-name:var(--font-zain)] text-[15px] font-normal leading-[1.65] tracking-normal text-[var(--mindly-purple-muted)]">
              {t('intro')}
            </p>
          </BlurFade>

          <BlurFade delay={0.55} inView>
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
                <Link href="/login" className={`${appBadgeCtaClass} !min-h-11 !min-w-0 !whitespace-normal px-3 py-2.5 text-[12px] sm:text-[14px] sm:!whitespace-nowrap sm:!min-w-[200px]`}>
                  {t('ctaMain')}
                </Link>

                <AppBadge asChild size="md" className={`${appBadgeCtaSecondaryClass} !min-h-11 !min-w-0 !whitespace-normal px-3 py-2.5 text-[12px] sm:text-[14px] sm:!whitespace-nowrap sm:!min-w-[200px]`}>
                  <Link href="/nos_services">
                    {t('ctaSecondary')}
                  </Link>
                </AppBadge>
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Diagramme à droite */}
        <BlurFade
          delay={0.2}
          inView
          className="relative order-2 min-w-0 flex h-[360px] w-full items-center justify-center overflow-hidden sm:h-[420px] md:h-[460px] lg:h-[470px] xl:h-[520px] lg:translate-x-0 xl:translate-x-4"
        >
          {/* 540×540 wrapper fully contains outer orbit (radius 202 + node 60 = 262px from center → 524px needed) */}
          <div className="relative flex h-[540px] w-[540px] flex-shrink-0 items-center justify-center scale-[0.60] sm:scale-[0.75] md:scale-[0.82] lg:scale-[0.78] xl:scale-[0.95]">
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="0 0 620 620"
              fill="none"
            >
              <circle
                cx="310"
                cy="310"
                r="202"
                stroke="var(--mindly-primary-light)"
                strokeWidth="1.8"
                strokeDasharray="5 8"
                opacity="0.58"
              />
              <circle
                cx="310"
                cy="310"
                r="152"
                stroke="var(--mindly-primary)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                opacity="0.48"
              />
            </svg>

            <div className="absolute z-20 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-[var(--mindly-primary-light)]/45 bg-[linear-gradient(90deg,#895ef8,#a987ff)] shadow-[0_18px_36px_rgba(137,94,248,0.28)]">
              <div className="absolute inset-2 rounded-full border border-white/40" />
              <div className="absolute inset-5 rounded-full border border-white/30" />
              <BrainCircuit className="relative h-10 w-10 text-white" />
            </div>

            <OrbitingCircles
              radius={202}
              duration={36}
              iconSize={NODE_SIZE}
              path={false}
              className="z-10"
            >
              {nodes.slice(0, 3).map(renderNode)}
            </OrbitingCircles>

            <OrbitingCircles
              radius={152}
              reverse
              duration={30}
              iconSize={NODE_SIZE}
              path={false}
              className="z-10"
            >
              {nodes.slice(3).map(renderNode)}
            </OrbitingCircles>
          </div>
        </BlurFade>
      </div>

    </section>
  )
}


