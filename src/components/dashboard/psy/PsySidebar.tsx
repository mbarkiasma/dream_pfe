'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from 'lucide-react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/psy', icon: LayoutDashboard },
  { title: 'Etudiants', href: '/dashboard/psy/students', icon: UsersRound },
  { title: 'Rendez-vous', href: '/dashboard/psy/rendez_vous', icon: CalendarDays },
  { title: 'Notifications', href: '/dashboard/psy/notifications', icon: Bell },
  { title: 'Mon profil', href: '/dashboard/psy/profil', icon: UserRound },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/psy') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PsySidebar() {
  const pathname = usePathname()

  return (
    <aside className="dream-sidebar">
      <div className="dream-sidebar-profile">
        <div className="dream-sidebar-brand-icon">
          <HeartPulse />
        </div>
        <div className="min-w-0">
          <p className="dream-sidebar-title">Espace psy</p>
          <p className="dream-sidebar-subtitle">Suivi clinique</p>
        </div>
      </div>

      <nav className="dream-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={active ? 'dream-sidebar-link-active' : 'dream-sidebar-link'}
            >
              <span className="dream-sidebar-icon">
                <Icon />
              </span>
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="dream-sidebar-footer">
        <LogoutButton showLabel />
      </div>
    </aside>
  )
}
