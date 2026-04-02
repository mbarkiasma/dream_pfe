'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

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
              className="text-[15px] font-medium text-violet-900/80 transition hover:text-violet-600"
            />
          ) : null,
        )}
      </div>

      {loginItem?.link && (
        <CMSLink
          {...loginItem.link}
          appearance="outline"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
        />
      )}

      {signupItem?.link && (
        <CMSLink
          {...signupItem.link}
          appearance="default"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(139,92,246,0.25)] transition hover:from-violet-600 hover:to-fuchsia-500"
        />
      )}
    </nav>
  )
}