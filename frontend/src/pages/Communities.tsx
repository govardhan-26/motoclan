import { useState } from 'react'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import CommunityCard from '../components/ui/CommunityCard'
import Skeleton from '../components/ui/Skeleton'
import { getCommunities } from '../api/communities'

export default function Communities() {
  const [query, setQuery] = useState('')

  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['communities'],
    queryFn: getCommunities,
  })

  const filtered = query
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()),
      )
    : communities

  const myCommunities = filtered.filter((c) => c.is_member)
  const discover = filtered.filter((c) => !c.is_member)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Communities</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="search"
          className="input-base pl-10"
          placeholder="Search communities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search communities"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-gray-500">
          <p>Failed to load communities. Please try again.</p>
        </div>
      ) : (
        <>
          {/* My Communities */}
          {myCommunities.length > 0 && (
            <section>
              <h2 className="font-semibold text-base text-gray-300 mb-3">My Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCommunities.map((c) => (
                  <CommunityCard key={c.community_id} community={c} />
                ))}
              </div>
            </section>
          )}

          {/* Discover */}
          <section>
            <h2 className="font-semibold text-base text-gray-300 mb-3">Discover Communities</h2>
            {discover.length === 0 ? (
              <div className="card p-10 text-center text-gray-500">
                <p>No communities found{query ? ` for "${query}"` : ''}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discover.map((c) => (
                  <CommunityCard key={c.community_id} community={c} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
