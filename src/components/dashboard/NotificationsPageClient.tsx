'use client'

import { Bell, CheckCheck, Circle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

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

const typeLabels: Record<string, string> = {
  analyse: 'Analyse',
  coaching: 'Coaching',
  motivation: 'Motivation',
  rendezvous: 'Rendez-vous',
  system: 'Systeme',
}

export function NotificationsPageClient() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const hasNotifications = notifications.length > 0
  const sortedNotifications = useMemo(() => notifications, [notifications])

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications?limit=500', {
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
      return true
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
      return false
    }

    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, status: 'read' } : item)),
    )
    setUnreadCount((current) => Math.max(0, current - 1))

    return true
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

    setNotifications((current) => current.map((item) => ({ ...item, status: 'read' })))
    setUnreadCount(0)
  }

  async function openNotification(notification: Notification) {
    await markAsRead(notification.id)

    if (notification.link) {
      router.push(notification.link)
    }
  }

  function formatDate(value?: string) {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  return (
    <div>
      <div className="mb-8 rounded-[30px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_55px_rgba(109,40,217,0.10)] backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
              Centre notifications
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#2d1068] md:text-4xl">
              Notifications
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6E628F] md:text-base">
              Consultez les nouvelles actions et ouvrez directement la page associee.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/80 bg-white px-4 text-sm font-bold text-[#6D28D9] shadow-[0_12px_28px_rgba(109,40,217,0.12)] transition hover:bg-[#F8F3FF] disabled:cursor-not-allowed disabled:text-[#C5BADB]"
          >
            <CheckCheck className="h-5 w-5" />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/75 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-[#EEE8FF] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3ECFF] text-[#6D28D9]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#2d1068]">Toutes les notifications</p>
              <p className="text-xs text-[#7B6B9A]">{unreadCount} non lue(s)</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="px-5 py-6 text-sm text-[#7B6B9A]">Chargement...</p>
        ) : !hasNotifications ? (
          <p className="px-5 py-6 text-sm text-[#7B6B9A]">Aucune notification pour le moment.</p>
        ) : (
          <div className="divide-y divide-[#F0EAFB]">
            {sortedNotifications.map((notification) => {
              const isUnread = notification.status === 'unread'
              const typeLabel = notification.type ? typeLabels[notification.type] || notification.type : 'Info'

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void openNotification(notification)}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-[#FAF7FF] ${
                    isUnread ? 'bg-[#FBF8FF]' : 'bg-white/60'
                  }`}
                >
                  <span
                    className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                      isUnread ? 'bg-[#EEE4FF] text-[#6D28D9]' : 'bg-[#F6F2FB] text-[#B3A5CB]'
                    }`}
                  >
                    <Circle className={`h-3 w-3 ${isUnread ? 'fill-current' : ''}`} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#2d1068]">{notification.title}</span>
                      <span className="rounded-full bg-[#F3ECFF] px-2 py-1 text-[11px] font-bold text-[#6D28D9]">
                        {typeLabel}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[#6E628F]">
                      {notification.message}
                    </span>
                    <span className="mt-2 block text-xs font-medium text-[#9B8BB7]">
                      {formatDate(notification.createdAt)}
                    </span>
                  </span>

                  {notification.link ? (
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-[#A18BBF]" />
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
