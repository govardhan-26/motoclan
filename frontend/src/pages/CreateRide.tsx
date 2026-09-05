import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Loader2, CheckCircle2, Navigation, Search,
  UserPlus, X, Share2, MessageSquare
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRide } from '../api/rides'
import { getFollowers, getFollowing } from '../api/users'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import type { UserProfile } from '../api/types'

interface CreateRideFormValues {
  title: string
  description: string
  start_location: string
  destination: string
  ride_date: string
  max_participants: number
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function LocationInput({
  id,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [detecting, setDetecting] = useState(false)
  const [geoError, setGeoError] = useState('')

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser')
      return
    }
    setDetecting(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await resp.json()
          const addr = data.address
          const city = addr.city || addr.town || addr.village || addr.county || ''
          const state = addr.state || ''
          const country = addr.country_code?.toUpperCase() || ''
          const location = [city, state, country].filter(Boolean).join(', ')
          onChange(location || data.display_name?.split(',').slice(0, 2).join(', ') || '')
        } catch {
          setGeoError('Could not determine location name')
        } finally {
          setDetecting(false)
        }
      },
      () => {
        setGeoError('Location access denied')
        setDetecting(false)
      },
      { timeout: 10000 }
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="relative flex gap-2">
        <input
          id={id}
          type="text"
          className="input-base flex-1"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="flex-shrink-0 px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-accent hover:border-accent/40 transition-colors flex items-center gap-1.5 text-xs"
          title="Use my current location"
        >
          {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {detecting ? '' : 'GPS'}
        </button>
      </div>
      {geoError && <p className="text-xs text-red-400">{geoError}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

function InviteSection({
  username,
  selected,
  onToggle,
}: {
  username: string
  selected: Set<string>
  onToggle: (profile: UserProfile) => void
}) {
  const [inviteSearch, setInviteSearch] = useState('')
  const debouncedSearch = useDebounce(inviteSearch, 200)

  const { data: followers = [] } = useQuery<UserProfile[]>({
    queryKey: ['followers', username],
    queryFn: () => getFollowers(username),
  })
  const { data: following = [] } = useQuery<UserProfile[]>({
    queryKey: ['following', username],
    queryFn: () => getFollowing(username),
  })

  const network = [...new Map([...followers, ...following].map(u => [u.user_id, u])).values()]

  const filtered = debouncedSearch
    ? network.filter(u =>
        u.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : network

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-accent" />
        <label className="text-sm font-medium text-gray-300">Invite Followers / Following</label>
        {selected.size > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
            {selected.size} selected
          </span>
        )}
      </div>

      {network.length === 0 ? (
        <p className="text-xs text-gray-600 py-2">Follow more riders to invite them to your ride.</p>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="search"
              className="input-base pl-9 text-sm py-2"
              placeholder="Search people to invite..."
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
              aria-label="Search invite list"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {filtered.map((profile) => {
              const isSelected = selected.has(profile.user_id)
              return (
                <button
                  key={profile.user_id}
                  type="button"
                  onClick={() => onToggle(profile)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left ${
                    isSelected ? 'bg-accent/10 border border-accent/30' : 'hover:bg-dark-hover border border-transparent'
                  }`}
                >
                  <Avatar src={profile.profile_image_url} name={profile.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-3">No matches found</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function CreateRide() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [startLocation, setStartLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [createdRide, setCreatedRide] = useState<{ id: string; title: string } | null>(null)
  const [locationErrors, setLocationErrors] = useState({ start: false, destination: false })

  const { register, handleSubmit, formState: { errors } } = useForm<CreateRideFormValues>({
    defaultValues: { max_participants: 10 },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateRideFormValues) =>
      createRide({
        ...data,
        start_location: startLocation,
        destination,
        invited_user_ids: [...selected],
      }),
    onSuccess: (ride) => {
      queryClient.invalidateQueries({ queryKey: ['rides'] })
      setCreatedRide({ id: ride.ride_id, title: ride.title })
    },
  })

  const onSubmit = (data: CreateRideFormValues) => {
    const errs = { start: !startLocation.trim(), destination: !destination.trim() }
    setLocationErrors(errs)
    if (errs.start || errs.destination) return
    createMutation.mutate(data)
  }

  const toggleInvite = (profile: UserProfile) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(profile.user_id)) next.delete(profile.user_id)
      else next.add(profile.user_id)
      return next
    })
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  // Share handlers after creation
  const handleShareWhatsApp = () => {
    if (!createdRide) return
    const url = `${window.location.origin}/rides/${createdRide.id}`
    const text = `Join my ride "${createdRide.title}" on MotoClan! ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareInstagram = async () => {
    if (!createdRide) return
    const url = `${window.location.origin}/rides/${createdRide.id}`
    try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    window.open('https://www.instagram.com/', '_blank')
  }

  if (createdRide) {
    return (
      <div className="space-y-5">
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ride Created!</h2>
            <p className="text-gray-400 text-sm mt-1">
              "{createdRide.title}" is live.{' '}
              {selected.size > 0 && `${selected.size} invite${selected.size > 1 ? 's' : ''} sent.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Share your ride</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={handleShareInstagram}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Instagram
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/rides/${createdRide.id}`)}
              className="btn-primary flex-1"
            >
              View Ride
            </button>
            <Link to="/rides" className="btn-secondary flex-1 text-center">
              Back to Rides
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/rides" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Rides
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-white">Create a Ride</h1>
        <p className="text-gray-500 text-sm mt-1">Organize a group ride for the community</p>
      </div>

      {createMutation.isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">Failed to create ride. Please try again.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-gray-300">
            Ride Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            className="input-base"
            placeholder="e.g., Coorg Weekend Ride"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 100, message: 'Title must be under 100 characters' },
            })}
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-gray-300">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            className="input-base resize-none"
            placeholder="Tell riders what to expect — route highlights, difficulty level, what to bring..."
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' },
            })}
          />
          {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </div>

        {/* Start location + Destination with GPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="start_location" className="text-sm font-medium text-gray-300">
              Start Location <span className="text-red-400">*</span>
            </label>
            <LocationInput
              id="start_location"
              placeholder="e.g., Bangalore, KA"
              value={startLocation}
              onChange={(v) => { setStartLocation(v); setLocationErrors((e) => ({ ...e, start: false })) }}
              error={locationErrors.start ? 'Start location is required' : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="destination" className="text-sm font-medium text-gray-300">
              Destination <span className="text-red-400">*</span>
            </label>
            <LocationInput
              id="destination"
              placeholder="e.g., Coorg, KA"
              value={destination}
              onChange={(v) => { setDestination(v); setLocationErrors((e) => ({ ...e, destination: false })) }}
              error={locationErrors.destination ? 'Destination is required' : undefined}
            />
          </div>
        </div>

        {/* Date + Max participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ride_date" className="text-sm font-medium text-gray-300">
              Ride Date <span className="text-red-400">*</span>
            </label>
            <input
              id="ride_date"
              type="date"
              min={minDateStr}
              className="input-base"
              {...register('ride_date', { required: 'Ride date is required' })}
            />
            {errors.ride_date && <p className="text-xs text-red-400">{errors.ride_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="max_participants" className="text-sm font-medium text-gray-300">
              Max Participants <span className="text-red-400">*</span>
            </label>
            <input
              id="max_participants"
              type="number"
              min={2}
              max={100}
              className="input-base"
              {...register('max_participants', {
                required: 'Max participants is required',
                min: { value: 2, message: 'At least 2 participants required' },
                max: { value: 100, message: 'Maximum 100 participants' },
                valueAsNumber: true,
              })}
            />
            {errors.max_participants && <p className="text-xs text-red-400">{errors.max_participants.message}</p>}
          </div>
        </div>

        {/* Invite section */}
        {user && (
          <div className="card p-4">
            <InviteSection
              username={user.username}
              selected={selected}
              onToggle={toggleInvite}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link to="/rides" className="btn-secondary flex-1 text-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
            ) : (
              `Create Ride${selected.size > 0 ? ` & Invite ${selected.size}` : ''}`
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
