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
    <div ref={containerRef} className="notification-bell-root">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="notification-bell-button"
      >
        <Bell />
        {unreadCount > 0 ? (
          <span className="notification-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="notification-bell-popover">
          <div className="notification-bell-header">
            <div>
              <p className="notification-bell-title">Notifications</p>
              <p className="notification-bell-count">{unreadCount} non lue(s)</p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="notification-bell-mark-button"
              aria-label="Tout marquer comme lu"
            >
              <CheckCheck />
            </button>
          </div>

          <div className="notification-bell-list">
            {isLoading ? (
              <p className="notification-bell-empty">Chargement...</p>
            ) : latestNotifications.length === 0 ? (
              <p className="notification-bell-empty">Aucune notification.</p>
            ) : (
              latestNotifications.map((notification) => {
                const createdAt = formatDate(notification.createdAt)
                const content = (
                  <div
                    className={`notification-bell-row ${
                      notification.status === 'unread' ? 'notification-bell-row-unread' : ''
                    }`}
                  >
                    <div className="notification-bell-row-inner">
                      <span
                        className={`notification-bell-dot ${
                          notification.status === 'unread' ? 'notification-bell-dot-unread' : ''
                        }`}
                      />
                      <div className="notification-bell-row-content">
                        <p className="notification-bell-row-title">{notification.title}</p>
                        <p className="notification-bell-row-message">{notification.message}</p>
                        {createdAt ? (
                          <p className="notification-bell-row-date">{createdAt}</p>
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
                    className="notification-bell-row-button"
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