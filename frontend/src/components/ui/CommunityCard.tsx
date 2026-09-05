import { Link } from 'react-router-dom'
import { Users, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Community } from '../../api/types'
import { toggleJoinCommunity } from '../../api/communities'

interface CommunityCardProps {
  community: Community
}

const categoryGradients: Record<string, string> = {
  'Adventure': 'from-emerald-600 to-teal-800',
  'Sport':     'from-red-600 to-rose-900',
  'Cruiser':   'from-amber-600 to-orange-900',
  'Off-Road':  'from-green-700 to-lime-900',
  'Touring':   'from-blue-600 to-indigo-900',
  'Urban':     'from-violet-600 to-purple-900',
  'Vintage':   'from-yellow-600 to-amber-900',
  'Electric':  'from-cyan-500 to-blue-900',
}

function getGradient(category: string): string {
  return categoryGradients[category] ?? 'from-gray-700 to-gray-900'
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const queryClient = useQueryClient()

  const joinMutation = useMutation({
    mutationFn: () => toggleJoinCommunity(community.community_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    },
  })

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault()
    joinMutation.mutate()
  }

  const optimisticMember = joinMutation.isSuccess
    ? !community.is_member
    : community.is_member
  const optimisticCount = joinMutation.isSuccess
    ? community.members_count + (community.is_member ? -1 : 1)
    : community.members_count

  return (
    <Link
      to={`/communities/${community.community_id}`}
      className="card overflow-hidden block hover:border-accent/40 transition-colors group"
    >
      {/* Cover */}
      <div className={`h-24 w-full relative bg-gradient-to-br ${getGradient(community.category)}`}>
        {community.cover_image_url && (
          <img
            src={community.cover_image_url}
            alt={community.name}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 left-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
          {community.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm group-hover:text-accent transition-colors leading-snug">
          {community.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{community.description}</p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>{optimisticCount.toLocaleString()} members</span>
          </div>

          <button
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
              optimisticMember
                ? 'bg-dark-card border border-accent text-accent hover:bg-accent/10'
                : 'btn-primary text-xs py-1'
            } disabled:opacity-60`}
            aria-label={optimisticMember ? 'Leave community' : 'Join community'}
          >
            {joinMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            {optimisticMember ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </Link>
  )
}
