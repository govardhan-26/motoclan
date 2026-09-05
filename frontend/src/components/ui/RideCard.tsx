import { MapPin, Calendar, Users, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Ride } from '../../api/types'
import Avatar from './Avatar'
import { useAuth } from '../../context/AuthContext'

interface RideCardProps {
  ride: Ride
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400',
  ongoing: 'bg-green-500/20 text-green-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

function JoinBadge({ ride, isOrganizer }: { ride: Ride; isOrganizer: boolean }) {
  const spotsLeft = ride.max_participants - ride.participants_count
  const isFull = spotsLeft <= 0

  if (isOrganizer) {
    return <span className="text-xs px-3 py-1.5 rounded-xl bg-accent/10 text-accent font-medium">Your Ride</span>
  }
  if (ride.is_joined) {
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Joined
      </span>
    )
  }
  if (ride.join_request_status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 font-medium">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    )
  }
  if (ride.join_request_status === 'rejected') {
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 font-medium">
        <XCircle className="w-3.5 h-3.5" /> Declined
      </span>
    )
  }
  if (isFull) {
    return <span className="text-xs px-3 py-1.5 rounded-xl bg-dark-border text-gray-500 font-medium">Full</span>
  }
  return (
    <span className="text-xs px-3 py-1.5 rounded-xl btn-primary font-medium">
      Request
    </span>
  )
}

export default function RideCard({ ride }: RideCardProps) {
  const { user } = useAuth()
  const isOrganizer = user?.user_id === ride.organizer.user_id

  return (
    <Link
      to={`/rides/${ride.ride_id}`}
      className="card p-4 space-y-3 block hover:border-accent/40 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base group-hover:text-accent transition-colors leading-snug flex-1">
          {ride.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[ride.status]}`}>
          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
        </span>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-2">
        <Avatar src={ride.organizer.profile_image_url} name={ride.organizer.full_name} size="sm" />
        <span className="text-xs text-gray-500">by {ride.organizer.full_name}</span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="truncate">{ride.start_location}</span>
        <ArrowRight className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{ride.destination}</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
        <span>{formatDate(ride.ride_date)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-dark-border">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>
            {ride.participants_count}/{ride.max_participants}
            {ride.participants_count < ride.max_participants && (
              <span className="text-xs text-gray-600 ml-1">
                ({ride.max_participants - ride.participants_count} left)
              </span>
            )}
          </span>
        </div>
        <JoinBadge ride={ride} isOrganizer={isOrganizer} />
      </div>
    </Link>
  )
}
