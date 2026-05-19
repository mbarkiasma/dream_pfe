import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { queryPageBySlug } from '@/utilities/queryPageBySlug'
import { draftMode } from 'next/headers'

const fallbackLayout = [
  { blockType: 'aboutHero' },
  { blockType: 'aboutTeam' },
  { blockType: 'aboutEthics' },
  { blockType: 'aboutVision' },
]

export default async function PageAPropos() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug: 'a-propos' })
  const layout = page?.layout?.length ? page.layout : fallbackLayout

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--mindly-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl relative">
        {draft && <LivePreviewListener />}
        <RenderBlocks blocks={layout} />
      </div>
    </main>
  )
}
