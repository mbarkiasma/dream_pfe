'use client'

import { ThemeToggle } from '@/components/ThemeToggle'
import { useLanguage } from '@/contexts/LanguageContext'

export function EntretienHeader() {
  const { lang } = useLanguage()

  return (
    <header className="interview-simple-header">
      <div>
        <p className="interview-kicker">
          {lang === 'en' ? 'Initial interview' : 'Entretien initial'}
        </p>
        <h1 className="interview-simple-title">
          {lang === 'en' ? 'Your interview' : 'Votre entretien'}
        </h1>
      </div>

      <div className="interview-simple-actions">
        <ThemeToggle />
      </div>
    </header>
  )
}
