import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import RideCard from '../components/ui/RideCard'
import CommunityCard from '../components/ui/CommunityCard'
import PostCard from '../components/ui/PostCard'
import Skeleton, { PostSkeleton } from '../components/ui/Skeleton'
import { searchUsers, toggleFollow } from '../api/users'
import { getRides } from '../api/rides'
import { getCommunities } from '../api/communities'
import { getFeed } from '../api/feed'

const TABS = ['Riders', 'Communities', 'Rides', 'Posts'] as const
type Tab = typeof TABS[number]

export default function Discover() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Riders')
  const queryClient = useQueryClient()

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  })

  const { data: rides = [], isLoading: ridesLoading } = useQuery({
    queryKey: ['rides'],
    queryFn: getRides,
  })

  const { data: communities = [], isLoading: commLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: getCommunities,
  })

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  const followMutation = useMutation({
    mutationFn: (username: string) => toggleFollow(username),
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: ['search', 'users', query] })
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
    },
  })

  const filteredRides = query
    ? rides.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
    : rides

  const filteredCommunities = query
    ? communities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : communities

  const filteredPosts = query
    ? posts.filter((p) => p.content.toLowerCase().includes(query.toLowerCase()))
    : posts

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-white">Discover</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="search"
          className="input-base pl-10"
          placeholder="Search riders, communities, rides..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
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

      {/* Riders */}
      {activeTab === 'Riders' && (
        <div className="space-y-3">
          {searchLoading ? (
            [1, 2, 3].map((n) => <Skeleton key={n} className="h-20 w-full" />)
          ) : query.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>Search for riders by name or username.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>No riders found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            searchResults.map((rider) => (
              <div key={rider.user_id} className="card p-4 flex items-center gap-3">
                <Link to={`/profile/${rider.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar src={rider.profile_image_url} name={rider.full_name} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{rider.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">@{rider.username}</p>
                    {rider.bio && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">{rider.bio}</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => followMutation.mutate(rider.username)}
                  disabled={followMutation.isPending && followMutation.variables === rider.username}
                  className={`flex-shrink-0 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
                    rider.is_following
                      ? 'bg-dark-card border border-accent text-accent hover:bg-accent/10'
                      : 'btn-primary text-sm py-1.5'
                  }`}
                >
                  {followMutation.isPending && followMutation.variables === rider.username && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {rider.is_following ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Communities */}
      {activeTab === 'Communities' && (
        <div>
          {commLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-40 w-full" />)}
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>No communities found{query ? ` for "${query}"` : ''}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCommunities.map((community) => (
                <CommunityCard key={community.community_id} community={community} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rides */}
      {activeTab === 'Rides' && (
        <div>
          {ridesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-40 w-full" />)}
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>No rides found{query ? ` for "${query}"` : ''}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRides.map((ride) => (
                <RideCard key={ride.ride_id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts */}
      {activeTab === 'Posts' && (
        <div>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => <PostSkeleton key={n} />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p>No posts found{query ? ` for "${query}"` : ''}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.post_id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
