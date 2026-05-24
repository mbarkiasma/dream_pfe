import type { ReactNode } from 'react'

import { FrontendChrome } from '@/components/layout/FrontendChrome'
import localization from '@/i18n/localization'
import { routing, type Locale } from '@/i18n/routing'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

type Args = {
  children: ReactNode
  params: Promise<{
    locale: Locale
  }>
}

export default async function LocaleLayout({ children, params }: Args) {
  const { locale } = await params
  const currentLocale = localization.locales.find((loc) => loc.code === locale)
  const direction = currentLocale && 'rtl' in currentLocale ? 'rtl' : 'ltr'

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={direction}>
        <FrontendChrome>{children}</FrontendChrome>
      </div>
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
