import { useEffect, useRef } from 'react'
import { X, Loader2, UserX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFollowers, getFollowing } from '../../api/users'
import Avatar from './Avatar'
import type { UserProfile } from '../../api/types'

interface Props {
  username: string
  type: 'followers' | 'following'
  onClose: () => void
}

function UserRow({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-dark-hover rounded-xl transition-colors">
      <Link to={`/profile/${profile.username}`} onClick={onClose} className="flex-shrink-0">
        <Avatar src={profile.profile_image_url} name={profile.full_name} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${profile.username}`}
          onClick={onClose}
          className="font-semibold text-sm hover:text-accent transition-colors block truncate"
        >
          {profile.full_name}
        </Link>
        <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
        {profile.motorcycle_details && (
          <p className="text-xs text-gray-600 truncate">{profile.motorcycle_details}</p>
        )}
      </div>
      <button
        onClick={() => {
          onClose()
          navigate(`/messages/${profile.username}`, { state: { profile } })
        }}
        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 font-medium transition-colors"
      >
        Message
      </button>
    </div>
  )
}

export default function FollowListModal({ username, type, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const { data = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: [type, username],
    queryFn: () => type === 'followers' ? getFollowers(username) : getFollowing(username),
  })

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const title = type === 'followers' ? 'Followers' : 'Following'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <div>
            <h2 className="font-bold text-base">{title}</h2>
            {!isLoading && (
              <p className="text-xs text-gray-500">{data.length} {type === 'followers' ? 'people follow you' : 'people you follow'}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-dark-hover transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600 gap-2">
              <UserX className="w-8 h-8" />
              <p className="text-sm">
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            data.map((profile) => (
              <UserRow key={profile.user_id} profile={profile} onClose={onClose} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
