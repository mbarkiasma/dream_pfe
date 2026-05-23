'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  { title: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { title: 'Mes reves', href: '/dashboard/student/dreams', icon: MoonStar },
  { title: 'Mon rapport', href: '/dashboard/student/analyses', icon: FileSearch },
  { title: 'Smart coaching', href: '/dashboard/student/coaching', icon: LifeBuoy },
  { title: 'Ma progression', href: '/dashboard/student/checkin', icon: NotebookPen },
  { title: 'Seances coach', href: '/dashboard/student/seances', icon: CalendarDays },
  { title: 'Annonces de motivation', href: '/dashboard/student/motivation', icon: Megaphone },
  { title: 'Rendez-vous', href: '/dashboard/student/rendez_vous', icon: CalendarDays },
  { title: 'Notifications', href: '/dashboard/student/notifications', icon: Bell },
  { title: 'Mon profil', href: '/dashboard/student/profile', icon: UserRound },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/student') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function StudentSidebar() {
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
            <p className="mindly-sidebar-title">Espace étudiant</p>
          </div>
        </div>

        <button
          type="button"
          className="mindly-sidebar-mobile-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
          <span>Menu</span>
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
