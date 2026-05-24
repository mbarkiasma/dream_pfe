import { clerkMiddleware } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl
  const isExcludedPath =
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/next') ||
    pathname.includes('/next/') ||
    /\.[^/]+$/.test(pathname)

  if (isExcludedPath) {
    return
  }

  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
