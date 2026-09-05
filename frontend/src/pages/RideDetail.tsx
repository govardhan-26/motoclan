import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Calendar, Users, ArrowLeft, ArrowRight, Map, Loader2,
  Clock, CheckCircle, XCircle, Share2, MessageSquare, Check
} from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { getRide, getRideRequests, requestJoinRide, cancelJoinRequest, actionRideRequest } from '../api/rides'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RideDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  const { data: ride, isLoading, error } = useQuery({
    queryKey: ['ride', id],
    queryFn: () => getRide(id!),
    enabled: !!id,
    refetchInterval: 15000,
  })

  const isOrganizer = user?.user_id === ride?.organizer.user_id

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['ride-requests', id],
    queryFn: () => getRideRequests(id!),
    enabled: !!id && isOrganizer,
    refetchInterval: 10000,
  })

  const requestJoinMutation = useMutation({
    mutationFn: () => requestJoinRide(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ride', id] }),
  })

  const cancelRequestMutation = useMutation({
    mutationFn: () => cancelJoinRequest(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ride', id] }),
  })

  const actionMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) =>
      actionRideRequest(id!, requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride', id] })
      queryClient.invalidateQueries({ queryKey: ['ride-requests', id] })
    },
  })

  const handleShare = async (via: 'whatsapp' | 'instagram') => {
    const url = window.location.href
    const text = ride ? `Join my ride "${ride.title}" on MotoClan! ${url}` : url

    if (via === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShareState('copied')
        setTimeout(() => setShareState('idle'), 2500)
      } catch { /* ignore */ }
      window.open('https://www.instagram.com/', '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-32" />
        <div className="card overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="p-5 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !ride) {
    return (
      <div className="space-y-4">
        <Link to="/rides" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Rides
        </Link>
        <div className="card p-8 text-center text-gray-500">
          <p>Failed to load ride details. Please try again.</p>
        </div>
      </div>
    )
  }

  const spotsLeft = ride.max_participants - ride.participants_count
  const isFull = spotsLeft <= 0

  return (
    <div className="space-y-5">
      <Link to="/rides" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Rides
      </Link>

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-accent/30 via-orange-900/20 to-dark-card relative flex items-end p-5">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
          <div className="relative z-10">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-2 inline-block ${
              ride.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
              ride.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </span>
            <h1 className="font-display text-2xl font-bold text-white">{ride.title}</h1>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Organizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={ride.organizer.profile_image_url} name={ride.organizer.full_name} size="md" />
              <div>
                <p className="text-xs text-gray-500">Organized by</p>
                <Link to={`/profile/${ride.organizer.username}`} className="font-semibold text-sm hover:text-accent transition-colors">
                  {ride.organizer.full_name}
                </Link>
              </div>
            </div>
            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  shareState === 'copied'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
                }`}
                title="Share on Instagram"
              >
                {shareState === 'copied' ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {shareState === 'copied' ? 'Link copied!' : 'Instagram'}
              </button>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-dark-bg rounded-xl p-3">
              <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">{formatDate(ride.ride_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dark-bg rounded-xl p-3">
              <Users className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Participants</p>
                <p className="text-sm font-medium">
                  {ride.participants_count}/{ride.max_participants}
                  {!isFull && <span className="text-gray-500 text-xs ml-1">({spotsLeft} spots left)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-dark-bg rounded-xl p-3 sm:col-span-2">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2 flex-wrap">
                <div>
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="text-sm font-medium">{ride.start_location}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm font-medium">{ride.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Join / Request action */}
          {isOrganizer ? (
            <div className="w-full py-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-center text-sm font-semibold">
              You're the organizer of this ride
            </div>
          ) : ride.is_joined ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              You're in! See you on the ride.
            </div>
          ) : ride.join_request_status === 'pending' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                Join request pending — waiting for organizer approval
              </div>
              <button
                onClick={() => cancelRequestMutation.mutate()}
                disabled={cancelRequestMutation.isPending}
                className="w-full py-2.5 rounded-xl border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {cancelRequestMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Request
              </button>
            </div>
          ) : ride.join_request_status === 'rejected' ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm">
              <XCircle className="w-4 h-4" />
              Your join request was declined
            </div>
          ) : (
            <button
              onClick={() => requestJoinMutation.mutate()}
              disabled={isFull || requestJoinMutation.isPending}
              className={`w-full py-3 font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isFull ? 'bg-dark-border text-gray-500 cursor-not-allowed' : 'btn-primary'
              }`}
            >
              {requestJoinMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isFull ? 'Ride Full' : 'Request to Join'}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card p-5">
        <h2 className="font-semibold text-base mb-3">About This Ride</h2>
        <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{ride.description}</p>
      </div>

      {/* Pending join requests — creator only */}
      {isOrganizer && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base">Join Requests</h2>
            {requests.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/20 text-accent font-medium">
                {requests.length} pending
              </span>
            )}
          </div>

          {requestsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.request_id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-xl">
                  <Link to={`/profile/${req.user.username}`} className="flex-shrink-0">
                    <Avatar src={req.user.profile_image_url} name={req.user.full_name} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${req.user.username}`} className="font-semibold text-sm hover:text-accent transition-colors block truncate">
                      {req.user.full_name}
                    </Link>
                    <p className="text-xs text-gray-500">@{req.user.username} · {timeAgo(req.created_at)}</p>
                    {req.user.motorcycle_details && (
                      <p className="text-xs text-gray-600 truncate">{req.user.motorcycle_details}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => actionMutation.mutate({ requestId: req.request_id, action: 'reject' })}
                      disabled={actionMutation.isPending}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Decline"
                      aria-label="Decline request"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => actionMutation.mutate({ requestId: req.request_id, action: 'approve' })}
                      disabled={actionMutation.isPending}
                      className="p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Approve"
                      aria-label="Approve request"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map placeholder */}
      <div className="card p-5">
        <h2 className="font-semibold text-base mb-4">Route Map</h2>
        <div className="h-52 rounded-xl bg-dark-bg border border-dark-border flex flex-col items-center justify-center gap-2 text-gray-600">
          <Map className="w-10 h-10" />
          <p className="text-sm font-medium">Map coming soon</p>
          <p className="text-xs">{ride.start_location} → {ride.destination}</p>
        </div>
      </div>
    </div>
  )
}
