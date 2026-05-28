'use client'

import { Bell, CheckCheck, Circle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

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

export function NotificationsPageClient() {
  const t = useTranslations('dashboard.student.notifications.page')
  const locale = useLocale()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const hasNotifications = notifications.length > 0
  const sortedNotifications = useMemo(() => notifications, [notifications])

  async function loadNotifications() {
    try {
      const response = await fetch(`/api/notifications?limit=500&locale=${locale}`, {
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

    return new Intl.DateTimeFormat(locale, {
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
    <div className="student-notifications-root">
      <div className="student-notifications-hero">
        <div className="student-notifications-hero-inner">
          <div>
            <p className="student-notifications-eyebrow">{t('eyebrow')}</p>
            <h1 className="student-notifications-title">{t('title')}</h1>
            <p className="student-notifications-description">{t('description')}</p>
          </div>

          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="student-notifications-mark-all"
          >
            <CheckCheck />
            {t('markAll')}
          </button>
        </div>
      </div>

      <div className="student-notifications-panel">
        <div className="student-notifications-panel-header">
          <div className="student-notifications-panel-title-row">
            <span className="student-notifications-icon">
              <Bell />
            </span>
            <div>
              <p className="student-notifications-panel-title">{t('panelTitle')}</p>
              <p className="student-notifications-panel-count">{t('unreadCount', { count: unreadCount })}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="student-notifications-empty">{t('loading')}</p>
        ) : !hasNotifications ? (
          <p className="student-notifications-empty">{t('empty')}</p>
        ) : (
          <div className="student-notifications-list">
            {sortedNotifications.map((notification) => {
              const isUnread = notification.status === 'unread'
              const typeKey = notification.type as 'analyse' | 'coaching' | 'motivation' | 'rendezvous' | 'system' | null
              const typeLabel = typeKey === 'analyse' ? t('typeAnalyse')
                : typeKey === 'coaching' ? t('typeCoaching')
                : typeKey === 'motivation' ? t('typeMotivation')
                : typeKey === 'rendezvous' ? t('typeRendezvous')
                : typeKey === 'system' ? t('typeSystem')
                : t('typeInfo')

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void openNotification(notification)}
                  className={`student-notifications-row ${
                    isUnread ? 'student-notifications-row-unread' : ''
                  }`}
                >
                  <span
                    className={`student-notifications-status-icon ${
                      isUnread ? 'student-notifications-status-icon-unread' : ''
                    }`}
                  >
                    <Circle className={isUnread ? 'fill-current' : ''} />
                  </span>

                  <span className="student-notifications-content">
                    <span className="student-notifications-title-line">
                      <span className="student-notifications-item-title">
                        {notification.title}
                      </span>
                      <span className="student-notifications-type">{typeLabel}</span>
                    </span>

                    <span className="student-notifications-message">{notification.message}</span>
                    <span className="student-notifications-date">
                      {formatDate(notification.createdAt)}
                    </span>
                  </span>

                  {notification.link ? <ExternalLink className="student-notifications-external" /> : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}