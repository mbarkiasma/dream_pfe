import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

const getPostsSitemap = unstable_cache(
  async () => {
    return []
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
