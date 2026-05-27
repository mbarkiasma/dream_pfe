'use client'

'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import {
  CalendarDays,
  Bell,
  FileSearch,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MoonStar,
  NotebookPen,
  UserRound,
  Megaphone,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { key: 'dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { key: 'dreams', href: '/dashboard/student/dreams', icon: MoonStar },
  { key: 'analyses', href: '/dashboard/student/analyses', icon: FileSearch },
  { key: 'coaching', href: '/dashboard/student/coaching', icon: LifeBuoy },
  { key: 'checkin', href: '/dashboard/student/checkin', icon: NotebookPen },
  { key: 'seances', href: '/dashboard/student/seances', icon: CalendarDays },
  { key: 'motivation', href: '/dashboard/student/motivation', icon: Megaphone },
  { key: 'appointments', href: '/dashboard/student/rendez_vous', icon: CalendarDays },
  { key: 'notifications', href: '/dashboard/student/notifications', icon: Bell },
  { key: 'profile', href: '/dashboard/student/profile', icon: UserRound },
] as const

type SidebarNavItem = (typeof navItems)[number]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/student') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function StudentSidebar() {
  const t = useTranslations('dashboard.student.sidebar')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className={menuOpen ? 'mindly-sidebar mindly-sidebar-open' : 'mindly-sidebar'}>
      <div className="mindly-sidebar-mobile-bar">
        <div className="mindly-sidebar-profile">
          <div className="mindly-sidebar-brand-icon">
            <MoonStar />
          </div>
          <div className="min-w-0">
            <p className="mindly-sidebar-title">{t('title')}</p>
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
              title={t(item.key)}
              className={active ? 'mindly-sidebar-link-active' : 'mindly-sidebar-link'}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mindly-sidebar-icon">
                <Icon />
              </span>
              <span className="truncate">{t(item.key)}</span>
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
