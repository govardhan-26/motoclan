export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  phone_number: string
  password: string
  username: string
  full_name: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RegisterResponse {
  user_id: string
  email: string
  phone_number: string
  username: string
  full_name: string
}

export interface UserProfile {
  user_id: string
  username: string
  full_name: string
  bio: string | null
  location: string | null
  profile_image_url: string | null
  motorcycle_details: string | null
  riding_experience_years: number | null
  followers_count: number
  following_count: number
  posts_count: number
  is_following?: boolean
}

export interface Post {
  post_id: string
  author: UserProfile
  content: string
  media_urls: string[]
  likes_count: number
  comments_count: number
  created_at: string
  is_liked: boolean
}

export interface Comment {
  comment_id: string
  author: UserProfile
  content: string
  created_at: string
}

export interface Ride {
  ride_id: string
  organizer: UserProfile
  title: string
  description: string
  start_location: string
  destination: string
  ride_date: string
  participants_count: number
  max_participants: number
  is_joined: boolean
  join_request_status: 'pending' | 'approved' | 'rejected' | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

export interface JoinRequest {
  request_id: string
  user: UserProfile
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Community {
  community_id: string
  name: string
  description: string
  cover_image_url: string | null
  members_count: number
  is_member: boolean
  category: string
}

export interface Message {
  message_id: string
  sender: UserProfile
  content: string
  created_at: string
  is_read: boolean
}

export interface Conversation {
  conversation_id: string
  participant: UserProfile
  last_message: Message
  unread_count: number
}

export interface Notification {
  notification_id: string
  type: 'follow' | 'like' | 'comment' | 'ride_invite' | 'ride_created' | 'ride_request' | 'ride_request_approved' | 'ride_request_rejected' | 'message' | 'community_invite'
  actor: UserProfile
  content: string
  created_at: string
  is_read: boolean
  link: string
}
