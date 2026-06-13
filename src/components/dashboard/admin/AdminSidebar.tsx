'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Menu, Shield, UsersRound, X } from 'lucide-react'
import { useState } from 'react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/admin/users', icon: UsersRound, label: 'Utilisateurs' },
] as const

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/admin') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className={menuOpen ? 'mindly-sidebar mindly-sidebar-open' : 'mindly-sidebar'}>
      <div className="mindly-sidebar-mobile-bar">
        <div className="mindly-sidebar-profile">
          <div className="mindly-sidebar-brand-icon">
            <Shield />
          </div>
          <div className="min-w-0">
            <p className="mindly-sidebar-title">Espace admin</p>
            <p className="mindly-sidebar-subtitle">Administration</p>
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
              title={item.label}
              className={active ? 'mindly-sidebar-link-active' : 'mindly-sidebar-link'}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mindly-sidebar-icon">
                <Icon />
              </span>
              <span className="leading-tight">{item.label}</span>
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
