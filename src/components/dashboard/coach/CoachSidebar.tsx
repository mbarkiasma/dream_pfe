'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Stethoscope,
  UserRound,
  UsersRound,
} from 'lucide-react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/coach', icon: LayoutDashboard },
  { title: 'Etudiants', href: '/dashboard/coach/students', icon: UsersRound },
  { title: 'Sessions', href: '/dashboard/coach/coaching', icon: LifeBuoy },
  { title: 'Exercices', href: '/dashboard/coach/exercices', icon: BookOpenCheck },
  { title: 'Rendez-vous', href: '/dashboard/coach/rendez_vous', icon: CalendarDays },
  { title: 'Notifications', href: '/dashboard/coach/notifications', icon: Bell },
  { title: 'Orientation psy', href: '/dashboard/coach/orientation_psy', icon: Stethoscope },
  { title: 'Annonces', href: '/dashboard/coach/annonces', icon: Megaphone },
  { title: 'Mon profil', href: '/dashboard/coach/profil', icon: UserRound },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/coach') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CoachSidebar() {
  const pathname = usePathname()

  return (
    <aside className="mindly-sidebar">
      <div className="mindly-sidebar-profile">
        <div className="mindly-sidebar-brand-icon">
          <LifeBuoy />
        </div>
        <div className="min-w-0">
          <p className="mindly-sidebar-title">Espace coach</p>
          <p className="mindly-sidebar-subtitle">Accompagnement</p>
        </div>
      </div>

      <nav className="mindly-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={active ? 'mindly-sidebar-link-active' : 'mindly-sidebar-link'}
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
