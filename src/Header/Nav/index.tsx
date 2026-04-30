'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { ThemeToggle } from '@/components/ThemeToggle'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  if (!navItems.length) return null

  const hasActionButtons = navItems.length >= 2

  const mainItems = hasActionButtons ? navItems.slice(0, -2) : navItems
  const loginItem = hasActionButtons ? navItems[navItems.length - 2] : null
  const signupItem = hasActionButtons ? navItems[navItems.length - 1] : null

  return (
    <nav className="flex items-center gap-3">
      <div className="hidden items-center gap-8 md:flex">
        {mainItems.map(({ link }, i) =>
          link ? (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-[15px] font-medium text-violet-900/80 hover:text-violet-600 dark:text-foreground/80 dark:hover:text-foreground"
            />
          ) : null,
        )}
      </div>

      <ThemeToggle />

      {loginItem?.link && (
        <CMSLink
          {...loginItem.link}
          appearance="outline"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent"
        />
      )}

      {signupItem?.link && (
        <CMSLink
          {...signupItem.link}
          appearance="default"
          className="inline-flex h-11 items-center justify-center rounded-xl dream-brand-bg px-6 text-sm font-semibold text-white shadow-dream-card hover:brightness-105"
        />
      )}
    </nav>
  )
}
