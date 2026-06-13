'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Menu,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { LogoutButton } from '@/components/dashboard/student/Logout'

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/psy') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PsySidebar({ specialty }: { specialty?: string | null }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslations('dashboard.psy.sidebar')

  const navItems = [
    { title: t('nav.dashboard'), href: '/dashboard/psy', icon: LayoutDashboard },
    { title: t('nav.students'), href: '/dashboard/psy/students', icon: UsersRound },
    { title: t('nav.appointments'), href: '/dashboard/psy/rendez_vous', icon: CalendarDays },
    { title: t('nav.notifications'), href: '/dashboard/psy/notifications', icon: Bell },
    { title: t('nav.profile'), href: '/dashboard/psy/profil', icon: UserRound },
  ]

  return (
    <aside className={menuOpen ? 'mindly-sidebar mindly-sidebar-open' : 'mindly-sidebar'}>
      <div className="mindly-sidebar-mobile-bar">
        <div className="mindly-sidebar-profile">
          <div className="mindly-sidebar-brand-icon">
            <HeartPulse />
          </div>
          <div className="min-w-0">
            <p className="mindly-sidebar-title">{t('title')}</p>
            <p className="mindly-sidebar-subtitle">{specialty || t('subtitle')}</p>
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
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={active ? 'mindly-sidebar-link-active' : 'mindly-sidebar-link'}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mindly-sidebar-icon">
                <Icon />
              </span>
              <span className="truncate">{item.title}</span>
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
