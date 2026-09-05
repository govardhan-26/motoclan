import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Bike, Star, Grid3x3, Settings, Loader2, MessageCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import Skeleton from '../components/ui/Skeleton'
import FollowListModal from '../components/ui/FollowListModal'
import PostCard from '../components/ui/PostCard'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, toggleFollow, getUserPosts } from '../api/users'

type ModalType = 'followers' | 'following' | null

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalType>(null)

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => getUserProfile(username!),
    enabled: !!username,
  })

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', username],
    queryFn: () => getUserPosts(username!),
    enabled: !!username,
  })

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(username!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
    },
  })

  const isOwnProfile = user?.username === username

  if (profileLoading) {
    return (
      <div className="space-y-5">
        <div className="card overflow-hidden">
          <div className="h-32 bg-dark-card animate-pulse" />
          <div className="px-5 pb-5 space-y-4 pt-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="card p-8 text-center text-gray-500">
        <p>Failed to load profile. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Follow-list modal */}
      {modal && (
        <FollowListModal
          username={username!}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}

      {/* Profile card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-accent/20 via-orange-900/20 to-dark-card" />

        {/* Avatar + actions */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="ring-4 ring-dark-card rounded-full">
              <Avatar src={profile.profile_image_url} name={profile.full_name} size="xl" />
            </div>

            {isOwnProfile ? (
              <Link to="/settings" className="btn-secondary flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {/* Message button */}
                <button
                  onClick={() => navigate(`/messages/${profile.username}`, { state: { profile } })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark-card border border-dark-border text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-hover transition-colors"
                  title={`Message ${profile.full_name}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </button>

                {/* Follow button */}
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`font-semibold px-5 py-2 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2 ${
                    profile.is_following
                      ? 'bg-dark-card border border-accent text-accent hover:bg-accent/10'
                      : 'btn-primary'
                  }`}
                >
                  {followMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {profile.is_following ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-gray-500 text-sm">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.motorcycle_details && (
                <div className="flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-accent" />
                  <span>{profile.motorcycle_details}</span>
                </div>
              )}
              {profile.riding_experience_years != null && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-accent" />
                  <span>{profile.riding_experience_years} yrs experience</span>
                </div>
              )}
            </div>

            {/* Stats — clickable */}
            <div className="flex gap-6 pt-1 border-t border-dark-border">
              <div className="text-center">
                <p className="font-bold text-lg text-white">{profile.posts_count}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <button
                onClick={() => setModal('followers')}
                className="text-center hover:opacity-80 transition-opacity group"
              >
                <p className="font-bold text-lg text-white group-hover:text-accent transition-colors">
                  {profile.followers_count.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-accent transition-colors">
                  Followers
                </p>
              </button>
              <button
                onClick={() => setModal('following')}
                className="text-center hover:opacity-80 transition-opacity group"
              >
                <p className="font-bold text-lg text-white group-hover:text-accent transition-colors">
                  {profile.following_count.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-accent transition-colors">
                  Following
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-sm text-gray-300">Posts</h2>
        </div>

        {postsLoading ? (
          <div className="card p-10 text-center text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">
            <p className="font-medium">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
