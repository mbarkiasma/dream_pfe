import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export default function Page() {
  notFound()
}

export function generateMetadata(): Metadata {
  return {
    title: 'Page introuvable',
  }
}
