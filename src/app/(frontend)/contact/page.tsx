import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { queryPageBySlug } from '@/utilities/queryPageBySlug'
import { draftMode } from 'next/headers'

const fallbackLayout = [{ blockType: 'contactHero' }, { blockType: 'contactContent' }]

export default async function PageContact() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug: 'contact' })
  const layout = page?.layout?.length ? page.layout : fallbackLayout

  return (
    <div
      style={{
        padding: '8px 0 26px',
        fontFamily: 'var(--font-zain), sans-serif',
        background: 'var(--mindly-bg)',
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          background: 'var(--mindly-bg)',
          borderRadius: 28,
          border: '1px solid var(--mindly-contact-border)',
          padding: '26px clamp(14px,3vw,34px) 34px',
          position: 'relative',
        }}
      >
        {draft && <LivePreviewListener />}
        <RenderBlocks blocks={layout} />
      </section>
    </div>
  )
}
