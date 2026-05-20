import type { CSSProperties } from 'react'

import { RenderBlocks, type LayoutBlock } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { queryPageBySlug } from '@/utilities/queryPageBySlug'
import { draftMode } from 'next/headers'

export type PublicBlocksPageConfig = {
  slug: string
  fallbackLayout: LayoutBlock[]
  className: string
  style?: CSSProperties
  innerClassName?: string
}

export async function PublicBlocksPage({
  className,
  fallbackLayout,
  innerClassName,
  slug,
  style,
}: PublicBlocksPageConfig) {
  const { isEnabled: draft } = await draftMode()
  const page = await queryPageBySlug({ slug })
  const layout = page?.layout?.length ? page.layout : fallbackLayout

  const content = (
    <>
      {draft && <LivePreviewListener />}
      <RenderBlocks blocks={layout} />
    </>
  )

  return (
    <main className={className} style={style}>
      {innerClassName ? <div className={innerClassName}>{content}</div> : content}
    </main>
  )
}
