'use client'

import { Bell, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type Notification = {
  id: string | number
  title: string
  message: string
  status: 'unread' | 'read'
  type?: string | null
  link?: string | null
  createdAt?: string
}

type NotificationsResponse = {
  notifications: Notification[]
  unreadCount: number
}

export function NotificationBell() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const latestNotifications = useMemo(() => notifications.slice(0, 8), [notifications])

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        cache: 'no-store',
      })

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as NotificationsResponse

      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: string | number) {
    const notification = notifications.find((item) => item.id === id)

    if (notification?.status === 'read') {
      return
    }

    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'mark-read',
        id,
      }),
    })

    if (!response.ok) {
      return
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, status: 'read' } : notification,
      ),
    )

    setUnreadCount((current) => Math.max(0, current - 1))
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return
    }

    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'mark-all-read',
      }),
    })

    if (!response.ok) {
      return
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: 'read',
      })),
    )

    setUnreadCount(0)
  }

  useEffect(() => {
    void loadNotifications()

    const interval = window.setInterval(() => {
      void loadNotifications()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (!isOpen) {
      return
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function formatDate(value?: string) {
    if (!value) return null

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
    }).format(date)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#4B2A82] shadow-[0_12px_28px_rgba(109,40,217,0.14)] transition hover:bg-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4D6D] px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-[100] mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_24px_70px_rgba(45,16,104,0.20)]">
          <div className="flex items-center justify-between border-b border-[#EEE8FF] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#2d1068]">Notifications</p>
              <p className="text-xs text-[#7B6B9A]">{unreadCount} non lue(s)</p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6D28D9] transition hover:bg-[#F4EFFF] disabled:cursor-not-allowed disabled:text-[#C5BADB]"
              aria-label="Tout marquer comme lu"
            >
              <CheckCheck className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-5 text-sm text-[#7B6B9A]">Chargement...</p>
            ) : latestNotifications.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#7B6B9A]">Aucune notification.</p>
            ) : (
              latestNotifications.map((notification) => {
                const createdAt = formatDate(notification.createdAt)
                const content = (
                  <div
                    className={`border-b border-[#F0EAFB] px-4 py-3 transition hover:bg-[#FAF7FF] ${
                      notification.status === 'unread' ? 'bg-[#FBF8FF]' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          notification.status === 'unread' ? 'bg-[#9B6BFF]' : 'bg-[#D8CDEF]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#2d1068]">{notification.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6E628F]">
                          {notification.message}
                        </p>
                        {createdAt ? (
                          <p className="mt-2 text-[11px] font-medium text-[#9B8BB7]">
                            {createdAt}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )

                if (notification.link) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={() => {
                        void markAsRead(notification.id)
                        setIsOpen(false)
                      }}
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void markAsRead(notification.id)}
                    className="block w-full text-left"
                  >
                    {content}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
