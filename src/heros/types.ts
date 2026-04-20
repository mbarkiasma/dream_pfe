import type React from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { Media } from '@/payload-types'
import { CMSLink } from '@/components/Link'

export type HeroLink = {
  link?: React.ComponentProps<typeof CMSLink>
}

export type HeroProps = {
  type?: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact'
  richText?: DefaultTypedEditorState | null
  media?: (Media & { caption?: DefaultTypedEditorState | null }) | string | null
  links?: HeroLink[] | null
}
