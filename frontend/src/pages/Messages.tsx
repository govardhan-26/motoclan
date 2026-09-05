import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Send, Search, MessageCircle, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import { useAuth } from '../context/AuthContext'
import { getConversations, getThread, sendMessage } from '../api/messages'
import { getUserProfile } from '../api/users'
import type { UserProfile, Message } from '../api/types'

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, myUserId }: { msg: Message; myUserId: string }) {
  const isMine = msg.sender?.user_id === myUserId
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2 mb-1`}>
      {!isMine && (
        <Avatar
          src={msg.sender?.profile_image_url ?? null}
          name={msg.sender?.full_name ?? '?'}
          size="sm"
        />
      )}
      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isMine
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-dark-card border border-dark-border rounded-bl-sm'
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-600 mt-0.5 px-1">
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-dark-border" />
      <span className="text-[10px] text-gray-600 flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-dark-border" />
    </div>
  )
}

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const { id: urlUsername } = useParams<{ id: string }>()
  const stateProfile = (location.state as { profile?: UserProfile } | null)?.profile

  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: urlProfile, isLoading: urlProfileLoading } = useQuery<UserProfile>({
    queryKey: ['profile', urlUsername],
    queryFn: () => getUserProfile(urlUsername!),
    enabled: !!urlUsername,
    placeholderData:
      urlUsername && stateProfile?.username === urlUsername ? stateProfile : undefined,
  })

  const activeUserId = urlProfile?.user_id ?? null

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 8000,
  })

  const { data: thread = [], isLoading: threadLoading } = useQuery({
    queryKey: ['thread', activeUserId],
    queryFn: () => getThread(activeUserId!),
    enabled: !!activeUserId,
    refetchInterval: 4000,
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(activeUserId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', activeUserId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    },
  })

  // Scroll to bottom whenever thread updates or conversation changes
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [thread, activeUserId])

  // Focus input on conversation open
  useEffect(() => {
    if (activeUserId) setTimeout(() => inputRef.current?.focus(), 150)
  }, [activeUserId])

  const handleSend = () => {
    if (!input.trim() || !activeUserId || sendMutation.isPending) return
    sendMutation.mutate(input.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSelectConvo = (username: string) => {
    navigate(`/messages/${username}`, { replace: true })
  }

  const handleBack = () => navigate('/messages', { replace: true })

  const activeConvoMeta = conversations.find((c) => c.participant.user_id === activeUserId)
  const activeProfile: UserProfile | null = activeConvoMeta?.participant ?? urlProfile ?? null

  const filteredConvos = conversations.filter(
    (c) =>
      !searchQuery ||
      c.participant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const showingChat = !!urlUsername

  // Build date-grouped message list
  const myUserId = user?.user_id ?? ''
  let lastMsgDate = ''
  const renderedMessages: React.ReactNode[] = []
  for (const msg of thread) {
    const msgDate = new Date(msg.created_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    if (msgDate !== lastMsgDate) {
      renderedMessages.push(<DateDivider key={`date-${msgDate}`} label={msgDate} />)
      lastMsgDate = msgDate
    }
    renderedMessages.push(<MessageBubble key={msg.message_id} msg={msg} myUserId={myUserId} />)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-48px)] -mx-4 -my-6 overflow-hidden rounded-none md:rounded-2xl border-0 md:border border-dark-border">

      {/* ── Conversation list ─────────────────────────────────────── */}
      <div
        className={`${
          showingChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-72 flex-col border-r border-dark-border bg-dark-surface min-h-0`}
      >
        <div className="p-3 border-b border-dark-border flex-shrink-0">
          <h2 className="font-semibold text-sm mb-2 px-1">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="search"
              className="input-base pl-9 text-xs py-2"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Ghost entry for new conversation */}
          {urlUsername && activeProfile && !activeConvoMeta && (
            <div className="bg-accent/10 border-r-2 border-accent px-3 py-3 flex items-center gap-3">
              <Avatar src={activeProfile.profile_image_url} name={activeProfile.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs truncate text-accent">{activeProfile.full_name}</p>
                <p className="text-[10px] text-gray-500 truncate">New conversation</p>
              </div>
            </div>
          )}

          {convsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : filteredConvos.length === 0 && !urlUsername ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-gray-600">
              <MessageCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Go to a profile and tap Message</p>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const isActive = activeUserId === convo.participant.user_id
              return (
                <button
                  key={convo.conversation_id}
                  onClick={() => handleSelectConvo(convo.participant.username)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    isActive ? 'bg-accent/10 border-r-2 border-accent' : 'hover:bg-dark-hover'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={convo.participant.profile_image_url}
                      name={convo.participant.full_name}
                      size="sm"
                    />
                    {convo.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {convo.unread_count > 9 ? '9+' : convo.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-xs truncate ${convo.unread_count > 0 ? 'text-white' : ''}`}>
                        {convo.participant.full_name}
                      </p>
                      <span className="text-[10px] text-gray-600 flex-shrink-0 ml-1">
                        {timeLabel(convo.last_message.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${convo.unread_count > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {convo.last_message.sender.user_id === user?.user_id ? 'You: ' : ''}
                      {convo.last_message.content}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat pane ────────────────────────────────────────────── */}
      {showingChat ? (
        <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-dark-bg">
          {urlProfileLoading && !activeProfile ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : activeProfile ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border bg-dark-surface flex-shrink-0">
                <button onClick={handleBack} className="md:hidden text-gray-400 hover:text-white flex-shrink-0" aria-label="Back">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Link to={`/profile/${activeProfile.username}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
                  <Avatar src={activeProfile.profile_image_url} name={activeProfile.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm group-hover:text-accent transition-colors truncate">
                      {activeProfile.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{activeProfile.username}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-accent transition-colors flex-shrink-0 ml-auto" />
                </Link>
              </div>

              {/* Messages — scrollable container */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 min-h-0"
              >
                {threadLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                ) : thread.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3 py-16">
                    <div className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm text-gray-400">{activeProfile.full_name}</p>
                      <p className="text-xs mt-1">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  renderedMessages
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-dark-border bg-dark-surface flex items-center gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  className="input-base flex-1"
                  placeholder={`Message ${activeProfile.full_name.split(' ')[0]}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Message input"
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMutation.isPending}
                  className="btn-primary p-2.5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  aria-label="Send message"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <p className="text-sm">User not found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-600 bg-dark-bg">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-gray-600" />
            </div>
            <p className="font-medium">Your Messages</p>
            <p className="text-sm mt-1 text-gray-600">Pick a conversation or go to a profile to start one</p>
          </div>
        </div>
      )}
    </div>
  )
}
