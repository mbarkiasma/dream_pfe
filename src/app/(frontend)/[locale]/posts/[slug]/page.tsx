import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post(_args: Args) {
  notFound()
}

export function generateMetadata(): Metadata {
  return {
    title: 'Page introuvable',
  }
}

export function generateStaticParams() {
  return []
}
