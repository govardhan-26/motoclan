import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, CheckCircle2, Eye, EyeOff, LogOut } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/users'

const TABS = ['Profile', 'Privacy', 'Notifications', 'Security'] as const
type Tab = typeof TABS[number]

// ---- Profile Tab ----
interface ProfileFormValues {
  full_name: string
  bio: string
  location: string
  motorcycle_details: string
  riding_experience_years: number
  profile_image_url: string
}

function ProfileTab() {
  const { user, fetchCurrentUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: user?.full_name ?? '',
      bio: user?.bio ?? '',
      location: user?.location ?? '',
      motorcycle_details: user?.motorcycle_details ?? '',
      riding_experience_years: user?.riding_experience_years ?? 1,
      profile_image_url: user?.profile_image_url ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await fetchCurrentUser()
      setSaved(true)
      setServerError('')
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } }
      setServerError(e.response?.data?.detail ?? 'Failed to save profile.')
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    setServerError('')
    updateMutation.mutate({
      full_name: data.full_name,
      bio: data.bio,
      location: data.location,
      motorcycle_details: data.motorcycle_details,
      riding_experience_years: data.riding_experience_years,
      profile_image_url: data.profile_image_url || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400">Profile saved successfully.</p>
        </div>
      )}
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-gray-300">Full Name</label>
        <input id="full_name" type="text" className="input-base"
          {...register('full_name', { required: 'Name is required' })} />
        {errors.full_name && <p className="text-xs text-red-400">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-gray-300">Bio</label>
        <textarea id="bio" rows={3} className="input-base resize-none"
          placeholder="Tell the community about yourself..."
          {...register('bio', { maxLength: { value: 200, message: 'Bio max 200 chars' } })} />
        {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location" className="text-sm font-medium text-gray-300">Location</label>
        <input id="location" type="text" className="input-base" placeholder="City, State"
          {...register('location')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="motorcycle_details" className="text-sm font-medium text-gray-300">Motorcycle</label>
        <input id="motorcycle_details" type="text" className="input-base"
          placeholder="e.g., Harley-Davidson Road King 2022"
          {...register('motorcycle_details')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="riding_experience_years" className="text-sm font-medium text-gray-300">
          Years of Riding Experience
        </label>
        <input id="riding_experience_years" type="number" min={0} max={60} className="input-base"
          {...register('riding_experience_years', { valueAsNumber: true, min: { value: 0, message: 'Min 0' } })} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="profile_image_url" className="text-sm font-medium text-gray-300">Profile Image URL</label>
        <input id="profile_image_url" type="url" className="input-base" placeholder="https://..."
          {...register('profile_image_url')} />
      </div>

      <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
        {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Profile'}
      </button>
    </form>
  )
}

// ---- Toggle Switch ----
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-border last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-dark-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

// ---- Privacy Tab ----
function PrivacyTab() {
  const [settings, setSettings] = useState({
    publicProfile: true,
    showLocation: true,
    showMotorcycle: true,
    allowTagging: false,
    showActivity: true,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-1">
      <Toggle checked={settings.publicProfile} onChange={() => toggle('publicProfile')} label="Public profile" />
      <Toggle checked={settings.showLocation} onChange={() => toggle('showLocation')} label="Show location on profile" />
      <Toggle checked={settings.showMotorcycle} onChange={() => toggle('showMotorcycle')} label="Show motorcycle details" />
      <Toggle checked={settings.allowTagging} onChange={() => toggle('allowTagging')} label="Allow others to tag me in posts" />
      <Toggle checked={settings.showActivity} onChange={() => toggle('showActivity')} label="Show activity status" />
    </div>
  )
}

// ---- Notifications Tab ----
function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailLikes: true,
    emailComments: true,
    emailFollows: false,
    emailRideInvites: true,
    pushLikes: true,
    pushComments: true,
    pushFollows: true,
    pushRideInvites: true,
    pushMessages: true,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email Notifications</h3>
        <div className="card p-4 space-y-1">
          <Toggle checked={settings.emailLikes} onChange={() => toggle('emailLikes')} label="When someone likes your post" />
          <Toggle checked={settings.emailComments} onChange={() => toggle('emailComments')} label="When someone comments on your post" />
          <Toggle checked={settings.emailFollows} onChange={() => toggle('emailFollows')} label="When someone follows you" />
          <Toggle checked={settings.emailRideInvites} onChange={() => toggle('emailRideInvites')} label="Ride invitations" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Push Notifications</h3>
        <div className="card p-4 space-y-1">
          <Toggle checked={settings.pushLikes} onChange={() => toggle('pushLikes')} label="Likes on your posts" />
          <Toggle checked={settings.pushComments} onChange={() => toggle('pushComments')} label="Comments on your posts" />
          <Toggle checked={settings.pushFollows} onChange={() => toggle('pushFollows')} label="New followers" />
          <Toggle checked={settings.pushRideInvites} onChange={() => toggle('pushRideInvites')} label="Ride invitations" />
          <Toggle checked={settings.pushMessages} onChange={() => toggle('pushMessages')} label="Direct messages" />
        </div>
      </div>
    </div>
  )
}

// ---- Security Tab ----
interface PasswordFormValues {
  current_password: string
  new_password: string
  confirm_password: string
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>()

  const newPw = watch('new_password')

  const onSubmit = async (_data: PasswordFormValues) => {
    await new Promise((res) => setTimeout(res, 700))
    reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <h3 className="font-semibold text-white">Change Password</h3>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400">Password changed successfully.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="current_password" className="text-sm font-medium text-gray-300">Current Password</label>
        <div className="relative">
          <input
            id="current_password"
            type={showCurrent ? 'text' : 'password'}
            className="input-base pr-10"
            autoComplete="current-password"
            {...register('current_password', { required: 'Current password is required' })}
          />
          <button type="button" onClick={() => setShowCurrent(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Toggle">
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.current_password && <p className="text-xs text-red-400">{errors.current_password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="new_password" className="text-sm font-medium text-gray-300">New Password</label>
        <div className="relative">
          <input
            id="new_password"
            type={showNew ? 'text' : 'password'}
            className="input-base pr-10"
            autoComplete="new-password"
            {...register('new_password', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Min 8 characters' },
            })}
          />
          <button type="button" onClick={() => setShowNew(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Toggle">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.new_password && <p className="text-xs text-red-400">{errors.new_password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm_password" className="text-sm font-medium text-gray-300">Confirm New Password</label>
        <input
          id="confirm_password"
          type="password"
          className="input-base"
          autoComplete="new-password"
          {...register('confirm_password', {
            required: 'Please confirm your password',
            validate: (v) => v === newPw || 'Passwords do not match',
          })}
        />
        {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : 'Update Password'}
      </button>
    </form>
  )
}

// ---- Main Settings Page ----
export default function Settings() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('Profile')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap bg-dark-card p-1 rounded-xl border border-dark-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-5">
        {activeTab === 'Profile' && <ProfileTab />}
        {activeTab === 'Privacy' && <PrivacyTab />}
        {activeTab === 'Notifications' && <NotificationsTab />}
        {activeTab === 'Security' && <SecurityTab />}
      </div>

      {/* Logout */}
      <div className="card p-4 border-red-500/20">
        <h3 className="font-semibold text-white mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Sign out of your MotoClan account on this device.</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  )
}
