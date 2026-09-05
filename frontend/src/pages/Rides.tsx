import { useState, useEffect } from 'react'
import { Plus, Search, Users, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import RideCard from '../components/ui/RideCard'
import Skeleton from '../components/ui/Skeleton'
import { getFeedRides, getExploreRides, getMyRides } from '../api/rides'

const TABS = ['For You', 'Explore', 'Joined'] as const
type Tab = typeof TABS[number]

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Rides() {
  const [activeTab, setActiveTab] = useState<Tab>('For You')
  const [rawSearch, setRawSearch] = useState('')
  const search = useDebounce(rawSearch, 300)

  const { data: feedRides = [], isLoading: feedLoading } = useQuery({
    queryKey: ['rides', 'feed', search],
    queryFn: () => getFeedRides(search),
    enabled: activeTab === 'For You',
  })

  const { data: exploreRides = [], isLoading: exploreLoading } = useQuery({
    queryKey: ['rides', 'explore', search],
    queryFn: () => getExploreRides(search),
    enabled: activeTab === 'Explore',
  })

  const { data: myRides = [], isLoading: myRidesLoading } = useQuery({
    queryKey: ['rides', 'mine'],
    queryFn: getMyRides,
    enabled: activeTab === 'Joined',
  })

  const isLoading =
    activeTab === 'For You' ? feedLoading :
    activeTab === 'Explore' ? exploreLoading :
    myRidesLoading

  const displayed =
    activeTab === 'For You' ? feedRides :
    activeTab === 'Explore' ? exploreRides :
    myRides

  const showSearch = activeTab !== 'Joined'

  const emptyMessages: Record<Tab, string> = {
    'For You': 'No rides from your network yet. Follow more riders or explore below!',
    'Explore': search ? `No rides found for "${search}"` : 'No rides to explore right now.',
    'Joined': 'You haven\'t joined any rides yet.',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Rides</h1>
        <Link to="/rides/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Create Ride
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card p-1 rounded-xl border border-dark-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setRawSearch('') }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            {tab === 'For You' && <Users className="w-3.5 h-3.5" />}
            {tab === 'Explore' && <Compass className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Search bar (For You + Explore only) */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="search"
            className="input-base pl-10"
            placeholder="Search rides by title or location..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            aria-label="Search rides"
          />
        </div>
      )}

      {/* Empty state for "For You" with no network rides */}
      {activeTab === 'For You' && !feedLoading && feedRides.length === 0 && !search && (
        <div className="card p-4 bg-accent/5 border-accent/20 flex items-start gap-3">
          <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent">No network rides yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Rides from people you follow or who follow you appear here. Try the Explore tab to discover rides!</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-52 w-full" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        activeTab === 'For You' && !search ? null : (
          <div className="card p-12 text-center text-gray-500">
            <p className="text-base font-medium">{emptyMessages[activeTab]}</p>
            {activeTab === 'For You' && (
              <button
                onClick={() => setActiveTab('Explore')}
                className="mt-3 btn-primary text-sm"
              >
                Explore All Rides
              </button>
            )}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayed.map((ride) => (
            <RideCard key={ride.ride_id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  )
}
