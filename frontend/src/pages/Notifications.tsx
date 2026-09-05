import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, UserPlus, MessageCircle, Map, Bell, CheckCheck,
  Loader2, MessageSquare, Bike, CheckCircle, XCircle, Users
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import { getNotifications, markAllRead, markOneRead } from '../api/notifications'
import type { Notification } from '../api/types'

const notifConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; label: string }
> = {
  like: {
    icon: <Heart className="w-3.5 h-3.5 text-red-400" />,
    bg: 'bg-red-500/10',
    label: 'liked your post',
  },
  follow: {
    icon: <UserPlus className="w-3.5 h-3.5 text-blue-400" />,
    bg: 'bg-blue-500/10',
    label: 'followed you',
  },
  comment: {
    icon: <MessageCircle className="w-3.5 h-3.5 text-green-400" />,
    bg: 'bg-green-500/10',
    label: 'commented on your post',
  },
  message: {
    icon: <MessageSquare className="w-3.5 h-3.5 text-sky-400" />,
    bg: 'bg-sky-500/10',
    label: 'sent you a message',
  },
  ride_created: {
    icon: <Bike className="w-3.5 h-3.5 text-accent" />,
    bg: 'bg-accent/10',
    label: 'created a ride',
  },
  ride_invite: {
    icon: <Map className="w-3.5 h-3.5 text-orange-400" />,
    bg: 'bg-orange-500/10',
    label: 'invited you to a ride',
  },
  ride_request: {
    icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
    bg: 'bg-purple-500/10',
    label: 'wants to join your ride',
  },
  ride_request_approved: {
    icon: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
    bg: 'bg-green-500/10',
    label: 'approved your ride request',
  },
  ride_request_rejected: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    bg: 'bg-red-500/10',
    label: 'declined your ride request',
  },
  community_invite: {
    icon: <Bell className="w-3.5 h-3.5 text-purple-400" />,
    bg: 'bg-purple-500/10',
    label: 'community update',
  },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function groupByDate(notifications: Notification[]): Array<{ label: string; items: Notification[] }> {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()

  const groups: Record<string, Notification[]> = {}
  for (const n of notifications) {
    const d = new Date(n.created_at).toDateString()
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : d
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

export default function Notifications() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 6000,
  })

  // Mark all as read as soon as the page is opened (Instagram-style)
  useEffect(() => {
    const unread = notifications.filter((n) => !n.is_read)
    if (unread.length === 0) return
    markAllRead()
      .then(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }))
      .catch(() => {})
  }, [notifications.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const groups = groupByDate(notifications)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors font-medium disabled:opacity-50"
          >
            {markAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider px-1 mb-2">{label}</p>
              <div className="space-y-1">
                {items.map((notif) => {
                  const config = notifConfig[notif.type] ?? {
                    icon: <Bell className="w-3.5 h-3.5 text-gray-400" />,
                    bg: 'bg-gray-500/10',
                    label: '',
                  }

                  return (
                    <Link
                      key={notif.notification_id}
                      to={notif.link ?? '/home'}
                      onClick={() => {
                        if (!notif.is_read) markOneMutation.mutate(notif.notification_id)
                      }}
                      className={`flex items-start gap-3 p-4 rounded-2xl transition-colors relative group ${
                        notif.is_read
                          ? 'hover:bg-dark-hover'
                          : 'bg-dark-card border border-dark-border hover:border-accent/40'
                      }`}
                    >
                      {!notif.is_read && (
                        <span className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full" />
                      )}

                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={notif.actor?.profile_image_url ?? null}
                          name={notif.actor?.full_name ?? 'MotoClan'}
                          size="md"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center border-2 border-dark-bg`}
                        >
                          {config.icon}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold">
                            {notif.actor?.full_name ?? 'MotoClan'}
                          </span>{' '}
                          <span className={notif.is_read ? 'text-gray-400' : 'text-gray-200'}>
                            {notif.content}
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
