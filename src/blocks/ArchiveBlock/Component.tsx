import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React from 'react'
import RichText from '@/components/RichText'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = (props) => {
  const { id, introContent } = props

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
