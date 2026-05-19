import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { queryPageBySlug } from '@/utilities/queryPageBySlug'
import { draftMode } from 'next/headers'

const fallbackLayout = [
  { blockType: 'featuresHero' },
  { blockType: 'featuresTabs' },
  { blockType: 'featureHighlight' },
  { blockType: 'nutrition' },
]

export default async function PageFonctionnalites() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug: 'fonctionnalites' })
  const layout = page?.layout?.length ? page.layout : fallbackLayout

  return (
    <main
      className="fonctionnalites-page bg-[var(--mindly-bg-strong)] font-[family-name:var(--font-zain)] [&_section>.pointer-events-none.absolute.inset-0]:!hidden [&_section]:!bg-transparent"
      style={{
        backgroundImage:
          'radial-gradient(circle at 16% 20%, rgba(137,94,248,0.10), transparent 28%), radial-gradient(circle at 82% 22%, rgba(137,94,248,0.10), transparent 30%), radial-gradient(circle at 50% 80%, rgba(169,135,255,0.08), transparent 30%)',
      }}
    >
      {draft && <LivePreviewListener />}
      <RenderBlocks blocks={layout} />
    </main>
  )
}
