import type { PublicBlocksPageConfig } from './PublicBlocksPage'

const publicPageBackground =
  'radial-gradient(circle at 24% 8%, rgba(137,94,248,0.08), transparent 30%), radial-gradient(circle at 82% 22%, rgba(137,94,248,0.10), transparent 34%), radial-gradient(circle at 48% 74%, rgba(169,135,255,0.08), transparent 36%)'

export const publicPageConfigs = {
  home: {
    slug: 'home',
    fallbackLayout: [
      { blockType: 'accompagnementHero' },
      { blockType: 'accompagnementStress' },
      { blockType: 'accompagnementProcess' },
    ],
    className: 'bg-[var(--mindly-bg)] font-[family-name:var(--font-zain)]',
    style: {
      backgroundImage: publicPageBackground,
    },
  },
  contact: {
    slug: 'contact',
    fallbackLayout: [{ blockType: 'contactHero' }, { blockType: 'contactContent' }],
    className: 'bg-[var(--mindly-bg)] px-0 py-2 pb-7 font-[family-name:var(--font-zain)]',
    innerClassName:
      'relative mx-auto max-w-[1240px] rounded-[28px] border border-[var(--mindly-contact-border)] bg-[var(--mindly-bg)] px-[clamp(14px,3vw,34px)] pb-8 pt-6',
  },
  fonctionnalites: {
    slug: 'fonctionnalites',
    fallbackLayout: [
      { blockType: 'featuresHero' },
      { blockType: 'featuresTabs' },
      { blockType: 'featureHighlight' },
      { blockType: 'nutrition' },
    ],
    className:
      'fonctionnalites-page bg-[var(--mindly-bg-strong)] font-[family-name:var(--font-zain)] [&_section>.pointer-events-none.absolute.inset-0]:!hidden [&_section]:!bg-transparent',
    style: {
      backgroundImage:
        'radial-gradient(circle at 16% 20%, rgba(137,94,248,0.10), transparent 28%), radial-gradient(circle at 82% 22%, rgba(137,94,248,0.10), transparent 30%), radial-gradient(circle at 50% 80%, rgba(169,135,255,0.08), transparent 30%)',
    },
  },
  aPropos: {
    slug: 'a-propos',
    fallbackLayout: [
      { blockType: 'aboutHero' },
      { blockType: 'aboutTeam' },
      { blockType: 'aboutEthics' },
      { blockType: 'aboutVision' },
    ],
    className:
      'relative min-h-screen overflow-hidden bg-[var(--mindly-bg)] px-4 py-10 sm:px-6 lg:px-8',
    innerClassName: 'relative mx-auto max-w-7xl',
  },
} satisfies Record<string, PublicBlocksPageConfig>
