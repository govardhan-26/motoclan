import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Loader2, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post } from '../../api/types'
import Avatar from './Avatar'
import { useAuth } from '../../context/AuthContext'
import { toggleLike, getComments, addComment, deletePost } from '../../api/feed'

interface PostCardProps {
  post: Post
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

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [liked, setLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [commentsCount, setCommentsCount] = useState(post.comments_count)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [shareLabel, setShareLabel] = useState<'Share' | 'Copied!'>('Share')
  const [showMenu, setShowMenu] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwnPost = user?.user_id === post.author.user_id

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.post_id),
    onSuccess: () => {
      setDeleted(true)
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts', post.author.username] })
    },
  })

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  // ── Like ──────────────────────────────────────────────────────────────────
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.post_id),
    onMutate: () => {
      setLiked((v) => !v)
      setLikesCount((v) => (liked ? v - 1 : v + 1))
    },
    onSuccess: (data) => {
      setLiked(data.liked)
      setLikesCount(data.likes_count)
    },
    onError: () => {
      setLiked((v) => !v)
      setLikesCount((v) => (liked ? v + 1 : v - 1))
    },
  })

  // ── Comments ──────────────────────────────────────────────────────────────
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', post.post_id],
    queryFn: () => getComments(post.post_id),
    enabled: showComments,
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => addComment(post.post_id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post.post_id] })
      setCommentText('')
      setCommentsCount((v) => v + 1)
    },
  })

  const handleToggleComments = () => {
    setShowComments((v) => {
      if (!v) setTimeout(() => commentInputRef.current?.focus(), 100)
      return !v
    })
  }

  const handlePostComment = () => {
    if (!commentText.trim() || commentMutation.isPending) return
    commentMutation.mutate(commentText.trim())
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const text = `${post.author.full_name} on MotoClan:\n"${post.content}"`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MotoClan Post', text })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareLabel('Copied!')
        setTimeout(() => setShareLabel('Share'), 2000)
      } catch {
        // clipboard not available
      }
    }
  }

  if (deleted) return null

  return (
    <article className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.author.profile_image_url} name={post.author.full_name} size="md" />
          <div>
            <p className="font-semibold text-sm group-hover:text-accent transition-colors">
              {post.author.full_name}
            </p>
            <p className="text-xs text-gray-500">
              @{post.author.username} · {timeAgo(post.created_at)}
            </p>
          </div>
        </Link>

        {isOwnPost && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-hover"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden w-40">
                <button
                  onClick={() => { setShowMenu(false); deleteMutation.mutate() }}
                  disabled={deleteMutation.isPending}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  {deleteMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>

      {/* Media */}
      {post.media_urls.length > 0 && (
        <div
          className={`grid gap-1 rounded-xl overflow-hidden ${
            post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.media_urls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative bg-dark-border aspect-video">
              <img
                src={url}
                alt={`Post media ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {i === 3 && post.media_urls.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
                  +{post.media_urls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-dark-border">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
            liked
              ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
              : 'text-gray-500 hover:text-white hover:bg-dark-hover'
          }`}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          aria-pressed={liked}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
            showComments
              ? 'text-accent bg-accent/10'
              : 'text-gray-500 hover:text-white hover:bg-dark-hover'
          }`}
          aria-label="Toggle comments"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
            shareLabel === 'Copied!'
              ? 'text-green-400 bg-green-500/10'
              : 'text-gray-500 hover:text-white hover:bg-dark-hover'
          }`}
          aria-label="Share post"
        >
          {shareLabel === 'Copied!' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          <span>{shareLabel}</span>
        </button>
      </div>

      {/* ── Comment section ─────────────────────────────────────────────────── */}
      {showComments && (
        <div className="space-y-3 pt-1 border-t border-dark-border">
          {/* Existing comments */}
          {commentsLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-2">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.comment_id} className="flex gap-2.5">
                  <Avatar
                    src={c.author.profile_image_url}
                    name={c.author.full_name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-dark-bg rounded-2xl rounded-tl-sm px-3 py-2">
                      <Link
                        to={`/profile/${c.author.username}`}
                        className="text-xs font-semibold hover:text-accent transition-colors"
                      >
                        {c.author.full_name}
                      </Link>
                      <p className="text-sm leading-snug mt-0.5">{c.content}</p>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 ml-3">
                      {timeAgo(c.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New comment input */}
          {user && (
            <div className="flex gap-2.5 items-center">
              <Avatar src={user.profile_image_url} name={user.full_name} size="sm" />
              <div className="flex-1 flex items-center gap-2 bg-dark-bg border border-dark-border rounded-2xl pl-3 pr-1.5 py-1.5">
                <input
                  ref={commentInputRef}
                  type="text"
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500 min-w-0"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePostComment()
                    }
                  }}
                  aria-label="Write a comment"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="p-1.5 rounded-xl bg-accent text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                  aria-label="Post comment"
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
