'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, Globe, Loader2, Moon, Sun, UserRound } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useEffect, useState } from 'react'
import { useTheme } from '@/providers/Theme'

type CompleteProfileClientProps = {
  defaultFirstName?: string
  defaultLastName?: string
  defaultStudentBranch?: string
  defaultStudentLevel?: string
}

const branchLevels = {
  LI: ['LI1', 'LI2', 'LI3'],
  LEA: ['LEA1', 'LEE2', 'LEE3'],
  LPE: ['LPE1', 'LPE2', 'LPE3'],
  PC: ['PC1', 'PC2'],
  MP: ['MP1', 'MP2'],
  LM: ['LMI1', 'LMI2', 'LMI3'],
  LSE: ['LSE1', 'LSE2', 'LSE3'],
  master: ['MR1PHY', 'MP1IASER', 'MP1BIO', 'MR1MATH'],
} as const

type StudentBranch = keyof typeof branchLevels
const branchOptions = Object.keys(branchLevels) as StudentBranch[]

type ProfileCopy = {
  themeLabel: string
  profileEyebrow: string
  profileTitle: string
  profileDescription: string
  firstNameLabel: string
  lastNameLabel: string
  firstNamePlaceholder: string
  lastNamePlaceholder: string
  branchLabel: string
  branchPlaceholder: string
  missingNames: string
  missingBranch: string
  submit: string
  submitError: string
  genericError: string
  switchLanguage: string
}

function getBranchForLevel(level: string): StudentBranch | '' {
  return (
    branchOptions.find((branch) => (branchLevels[branch] as readonly string[]).includes(level)) ??
    ''
  )
}

const profileCopy: Record<'fr' | 'en', ProfileCopy> = {
  fr: {
    themeLabel: 'Theme',
    profileEyebrow: 'Profil etudiant',
    profileTitle: 'Completez votre profil',
    profileDescription: 'Ces informations seront utilisees dans votre dashboard, vos rapports et votre suivi.',
    firstNameLabel: 'Prenom',
    lastNameLabel: 'Nom',
    firstNamePlaceholder: 'Votre prenom',
    lastNamePlaceholder: 'Votre nom',
    branchLabel: 'Branche et niveau',
    branchPlaceholder: 'Choisir votre branche et votre niveau',
    missingNames: 'Veuillez renseigner votre prenom et votre nom.',
    missingBranch: 'Veuillez selectionner votre branche et votre niveau.',
    submit: 'Continuer vers mon dashboard',
    submitError: 'Profil impossible a mettre a jour.',
    genericError: 'Une erreur est survenue.',
    switchLanguage: 'Changer de langue',
  },
  en: {
    themeLabel: 'Theme',
    profileEyebrow: 'Student profile',
    profileTitle: 'Complete your profile',
    profileDescription: 'This information will be used in your dashboard, reports and follow-up.',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    firstNamePlaceholder: 'Your first name',
    lastNamePlaceholder: 'Your last name',
    branchLabel: 'Branch and level',
    branchPlaceholder: 'Choose your branch and your level',
    missingNames: 'Please enter your first and last name.',
    missingBranch: 'Please select your branch and your level.',
    submit: 'Continue to my dashboard',
    submitError: 'Unable to update profile.',
    genericError: 'Something went wrong.',
    switchLanguage: 'Switch language',
  },
} as const

export function CompleteProfileClient({
  defaultFirstName = '',
  defaultLastName = '',
  defaultStudentBranch = '',
  defaultStudentLevel = '',
}: CompleteProfileClientProps) {
  const router = useRouter()
  const locale = useLocale() as 'fr' | 'en'
  const pathname = usePathname()
  const copy = profileCopy[locale] ?? profileCopy.fr
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [studentBranch, setStudentBranch] = useState(defaultStudentBranch)
  const [studentLevel, setStudentLevel] = useState(defaultStudentLevel)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  const isDark = mounted && theme === 'dark'

  const switchLanguage = () => {
    router.replace(pathname, { locale: locale === 'fr' ? 'en' : 'fr' })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanStudentBranch = studentBranch.trim()
    const cleanStudentLevel = studentLevel.trim()

    setErrorMessage('')

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage(copy.missingNames)
      return
    }

    if (!cleanStudentBranch || !cleanStudentLevel) {
      setErrorMessage(copy.missingBranch)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          studentBranch: cleanStudentBranch,
          studentLevel: cleanStudentLevel,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || copy.submitError)
      }

      router.replace('/entretien')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="complete-profile-page">
      <div className="login-theme-switch flex gap-2">
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
          aria-label={copy.themeLabel}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={switchLanguage}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
          aria-label={copy.switchLanguage}
          title={`${locale.toUpperCase()} — ${copy.switchLanguage}`}
        >
          <Globe className="h-4 w-4" />
        </button>
      </div>

      <div className="complete-profile-shell">
        <section className="complete-profile-card">
          <div className="complete-profile-header">
            <div className="complete-profile-icon">
              <UserRound />
            </div>

            <p className="complete-profile-eyebrow">{copy.profileEyebrow}</p>

            <h1 className="complete-profile-title">{copy.profileTitle}</h1>

            <p className="complete-profile-description">{copy.profileDescription}</p>
          </div>

          <form className="complete-profile-form" onSubmit={handleSubmit}>
            <div className="complete-profile-grid">
              <div className="complete-profile-field">
                <label className="complete-profile-label" htmlFor="firstName">
                  {copy.firstNameLabel}
                </label>

                <input
                  className="complete-profile-input"
                  disabled={isSubmitting}
                  id="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={copy.firstNamePlaceholder}
                  type="text"
                  value={firstName}
                />
              </div>

              <div className="complete-profile-field">
                <label className="complete-profile-label" htmlFor="lastName">
                  {copy.lastNameLabel}
                </label>

                <input
                  className="complete-profile-input"
                  disabled={isSubmitting}
                  id="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={copy.lastNamePlaceholder}
                  type="text"
                  value={lastName}
                />
              </div>

              <div className="complete-profile-field complete-profile-field-wide">
                <label className="complete-profile-label" htmlFor="studentLevel">
                  {copy.branchLabel}
                </label>

                <select
                  className="complete-profile-input complete-profile-select"
                  disabled={isSubmitting}
                  id="studentLevel"
                  onChange={(event) => {
                    const nextLevel = event.target.value

                    setStudentLevel(nextLevel)
                    setStudentBranch(getBranchForLevel(nextLevel))
                  }}
                  value={studentLevel}
                >
                  <option value="">{copy.branchPlaceholder}</option>
                  {branchOptions.map((branch) => (
                    <optgroup key={branch} label={branch === 'master' ? 'Master' : branch}>
                      {branchLevels[branch].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage ? (
              <div className="complete-profile-error">
                <AlertCircle />
                {errorMessage}
              </div>
            ) : null}

            <Button
              variant="dream"
              size="lg"
              disabled={isSubmitting}
              type="submit"
              className="complete-profile-submit"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {copy.submit}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
