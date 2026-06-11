'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  Bell,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Megaphone,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navKeys = [
  { key: 'dashboard', href: '/dashboard/coach', icon: LayoutDashboard },
  { key: 'students', href: '/dashboard/coach/students', icon: UsersRound },
  { key: 'sessions', href: '/dashboard/coach/coaching', icon: LifeBuoy },
  { key: 'exercises', href: '/dashboard/coach/exercices', icon: BookOpenCheck },
  { key: 'appointments', href: '/dashboard/coach/seances', icon: CalendarDays },
  { key: 'notifications', href: '/dashboard/coach/notifications', icon: Bell },
  { key: 'orientationPsy', href: '/dashboard/coach/orientation_psy', icon: Stethoscope },
  { key: 'announcements', href: '/dashboard/coach/motivation', icon: Megaphone },
  { key: 'profile', href: '/dashboard/coach/profil', icon: UserRound },
] as const

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/coach') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CoachSidebar() {
  const pathname = usePathname()
  const t = useTranslations('dashboard.coach.sidebar')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className={menuOpen ? 'mindly-sidebar mindly-sidebar-open' : 'mindly-sidebar'}>
      <div className="mindly-sidebar-mobile-bar">
        <div className="mindly-sidebar-profile">
          <div className="mindly-sidebar-brand-icon">
            <LifeBuoy />
          </div>
          <div className="min-w-0">
            <p className="mindly-sidebar-title">{t('title')}</p>
            <p className="mindly-sidebar-subtitle">{t('subtitle')}</p>
          </div>
        </div>

        <button
          type="button"
          className="mindly-sidebar-mobile-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
          <span>{t('menu')}</span>
        </button>
      </div>

      <nav className={menuOpen ? 'mindly-sidebar-nav mindly-sidebar-nav-open' : 'mindly-sidebar-nav'}>
        {navKeys.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)
          const label = t(item.key)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={label}
              className={active ? 'mindly-sidebar-link-active' : 'mindly-sidebar-link'}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mindly-sidebar-icon">
                <Icon />
              </span>
              <span className="leading-tight">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mindly-sidebar-footer">
        <LogoutButton showLabel />
      </div>
    </aside>
  )
}
