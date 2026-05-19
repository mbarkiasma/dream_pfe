'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, Lang } from '@/lib/translations'

interface LanguageContextType {
  lang: Lang
  t: typeof translations.fr
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  t: translations.fr,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    const stored = window.localStorage.getItem('mindly-language') as Lang | null
    if (stored === 'en') {
      setLang('en')
    }
    document.documentElement.setAttribute('lang', stored ?? 'fr')
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'fr' ? 'en' : 'fr'
    setLang(next)
    document.documentElement.setAttribute('lang', next)
    window.localStorage.setItem('mindly-language', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
