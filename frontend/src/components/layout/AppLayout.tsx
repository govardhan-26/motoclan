import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Home, Compass, Map, Users, MessageCircle, Bell, User,
  Settings, LogOut, Sun, Moon, Menu, X, Bike,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getConversations } from '../../api/messages'
import { getNotifications } from '../../api/notifications'
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

function Badge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none pointer-events-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function SidebarLink({ item, isDark }: { item: NavItem; isDark: boolean }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? 'bg-accent/20 text-accent'
            : `text-gray-400 hover:bg-dark-hover ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`
        }`
      }
    >
      <div className="relative flex-shrink-0">
        {item.icon}
        <Badge count={item.badge ?? 0} />
      </div>
      <span>{item.label}</span>
    </NavLink>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const profilePath = `/profile/${user?.username ?? 'me'}`

  // Open SSE connection — pushes invalidate queries instantly on any backend change
  useRealtimeUpdates()

  // Background queries — SSE handles instant updates; polling is just a safety fallback
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const { data: notifData = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Suppress badge while user is on the respective page (Instagram-style)
  const isOnMessages = location.pathname.startsWith('/messages')
  const isOnNotifications = location.pathname === '/notifications'

  const rawUnreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0)
  const rawUnreadNotifs = notifData.filter((n) => !n.is_read).length

  const unreadMessages = isOnMessages ? 0 : rawUnreadMessages
  const unreadNotifs = isOnNotifications ? 0 : rawUnreadNotifs

  const mainNavItems: NavItem[] = [
    { to: '/home',          label: 'Home',          icon: <Home          className="w-5 h-5" /> },
    { to: '/discover',      label: 'Discover',      icon: <Compass       className="w-5 h-5" /> },
    { to: '/rides',         label: 'Rides',         icon: <Map           className="w-5 h-5" /> },
    { to: '/communities',   label: 'Communities',   icon: <Users         className="w-5 h-5" /> },
    { to: '/messages',      label: 'Messages',      icon: <MessageCircle className="w-5 h-5" />, badge: unreadMessages || undefined },
    { to: '/notifications', label: 'Notifications', icon: <Bell          className="w-5 h-5" />, badge: unreadNotifs   || undefined },
  ]

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-dark-bg flex">

      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-dark-border flex-shrink-0">
          <NavLink to="/home" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-wide">
              MOTO<span className="text-accent">CLAN</span>
            </span>
          </NavLink>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          {mainNavItems.map((item) => (
            <SidebarLink key={item.to} item={item} isDark={isDark} />
          ))}
          <SidebarLink isDark={isDark} item={{ to: profilePath, label: 'Profile',  icon: <User     className="w-5 h-5" /> }} />
          <SidebarLink isDark={isDark} item={{ to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }} />
        </nav>

        {/* Bottom: theme + logout */}
        <div className="px-3 py-4 border-t border-dark-border space-y-1 flex-shrink-0">
          <button
            onClick={toggle}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-dark-hover transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4 py-3">
        <NavLink to="/home" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <Bike className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">
            MOTO<span className="text-accent">CLAN</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          {/* Notification shortcut with badge */}
          <NavLink
            to="/notifications"
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-accent rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </NavLink>

          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-hover hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-hover hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile} />
          <div className="absolute top-0 right-0 w-64 h-full bg-dark-surface border-l border-dark-border flex flex-col">
            <div className="pt-16 px-4 flex-1 overflow-y-auto min-h-0">
              <nav className="space-y-1 py-4">
                {[
                  ...mainNavItems,
                  { to: profilePath, label: 'Profile',  icon: <User     className="w-5 h-5" /> },
                  { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent/20 text-accent'
                          : `text-gray-400 hover:bg-dark-hover ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`
                      }`
                    }
                  >
                    <div className="relative flex-shrink-0">
                      {item.icon}
                      {'badge' in item && item.badge ? <Badge count={item.badge} /> : null}
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="px-4 pb-6 border-t border-dark-border pt-3 flex-shrink-0 space-y-1">
              <button
                onClick={() => { closeMobile(); toggle() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-dark-hover transition-colors ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={() => { closeMobile(); logout() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-surface border-t border-dark-border flex items-center justify-around px-1 py-2">
        {[
          { to: '/home',        label: 'Home',     icon: <Home          className="w-5 h-5" /> },
          { to: '/discover',    label: 'Discover', icon: <Compass       className="w-5 h-5" /> },
          { to: '/rides',       label: 'Rides',    icon: <Map           className="w-5 h-5" /> },
          { to: '/communities', label: 'Community',icon: <Users         className="w-5 h-5" /> },
          { to: '/messages',    label: 'Messages', icon: <MessageCircle className="w-5 h-5" />, badge: unreadMessages },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <div className="relative">
              {item.icon}
              {'badge' in item && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-accent rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to={profilePath}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
              isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </nav>
    </div>
  )
}
