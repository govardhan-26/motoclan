import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import Skeleton, { PostSkeleton } from '../components/ui/Skeleton'
import { getCommunity, toggleJoinCommunity, getCommunityPosts } from '../api/communities'

const TABS = ['Posts', 'Members'] as const
type Tab = typeof TABS[number]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('Posts')

  const { data: community, isLoading, error } = useQuery({
    queryKey: ['community', id],
    queryFn: () => getCommunity(id!),
    enabled: !!id,
  })

  const { data: communityPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community', id, 'posts'],
    queryFn: () => getCommunityPosts(id!),
    enabled: !!id && activeTab === 'Posts',
  })

  const joinMutation = useMutation({
    mutationFn: () => toggleJoinCommunity(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', id] })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-32" />
        <div className="card overflow-hidden">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="p-5 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !community) {
    return (
      <div className="space-y-4">
        <Link
          to="/communities"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </Link>
        <div className="card p-8 text-center text-gray-500">
          <p>Failed to load community. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        to="/communities"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Communities
      </Link>

      {/* Cover header */}
      <div className="card overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-emerald-600/40 to-teal-900/40 relative">
          {community.cover_image_url && (
            <img
              src={community.cover_image_url}
              alt={community.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full backdrop-blur-sm mb-2 inline-block">
              {community.category}
            </span>
            <h1 className="font-display text-2xl font-bold text-white">{community.name}</h1>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">{community.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{community.members_count.toLocaleString()} members</span>
            </div>
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className={`font-semibold px-6 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
                community.is_member
                  ? 'bg-dark-bg border-2 border-accent text-accent hover:bg-accent/10'
                  : 'btn-primary'
              }`}
            >
              {joinMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {community.is_member ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card p-1 rounded-xl border border-dark-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === 'Posts' && (
        <div className="space-y-4">
          {postsLoading ? (
            [1, 2, 3].map((n) => <PostSkeleton key={n} />)
          ) : communityPosts.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p className="font-medium">No posts yet</p>
              <p className="text-sm mt-1">Be the first to post in this community.</p>
            </div>
          ) : (
            communityPosts.map((post) => (
              <article key={post.post_id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={post.author.profile_image_url}
                    name={post.author.full_name}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-sm">{post.author.full_name}</p>
                    <p className="text-xs text-gray-500">
                      @{post.author.username} · {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{post.content}</p>
                <div className="flex gap-4 text-xs text-gray-500 pt-1 border-t border-dark-border">
                  <span>{post.likes_count} likes</span>
                  <span>{post.comments_count} comments</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'Members' && (
        <div className="card p-8 text-center text-gray-500">
          <p className="font-medium">{community.members_count.toLocaleString()} members</p>
          <p className="text-sm mt-1">Member list coming soon.</p>
        </div>
      )}
    </div>
  )
}
