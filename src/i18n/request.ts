import { getRequestConfig } from 'next-intl/server'

import { routing, type Locale } from './routing'

import fr from './messages/fr.json'

type Messages = typeof fr

declare global {
  interface IntlMessages extends Messages {}
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
