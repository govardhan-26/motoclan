// Prisma include objects — reused across routes to avoid N+1 queries

function userInclude(currentUserId) {
  const inc = {
    _count: { select: { followers: true, following: true, posts: true } }
  }
  if (currentUserId) {
    inc.followers = { where: { follower_id: currentUserId } }
  }
  return inc
}

function postInclude(currentUserId) {
  const inc = {
    author: { include: userInclude(currentUserId) },
    _count: { select: { likes: true, comments: true } }
  }
  if (currentUserId) {
    inc.likes = { where: { user_id: currentUserId } }
  }
  return inc
}

function rideInclude(currentUserId) {
  const inc = {
    organizer: { include: userInclude(currentUserId) },
    participants: true,
    _count: { select: { participants: true } }
  }
  if (currentUserId) {
    inc.join_requests = { where: { user_id: currentUserId } }
  }
  return inc
}

// Formatters — take Prisma objects and return API response shapes

function formatUser(user, currentUserId = null) {
  return {
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    bio: user.bio || null,
    location: user.location || null,
    profile_image_url: user.profile_image_url || null,
    motorcycle_details: user.motorcycle_details || null,
    riding_experience_years: user.riding_experience_years || null,
    followers_count: user._count?.followers ?? 0,
    following_count: user._count?.following ?? 0,
    posts_count: user._count?.posts ?? 0,
    is_following: currentUserId ? (user.followers?.length ?? 0) > 0 : false,
  }
}

function formatPost(post, currentUserId = null) {
  return {
    post_id: post.id,
    content: post.content,
    media_urls: post.media_urls || [],
    likes_count: post._count?.likes ?? 0,
    comments_count: post._count?.comments ?? 0,
    created_at: post.created_at,
    is_liked: currentUserId ? (post.likes?.length ?? 0) > 0 : false,
    author: post.author ? formatUser(post.author, currentUserId) : null,
  }
}

function formatRide(ride, currentUserId = null) {
  const isJoined = currentUserId
    ? (ride.participants ?? []).some(p => p.user_id === currentUserId)
    : false
  const joinRequest = currentUserId
    ? (ride.join_requests ?? []).find(r => r.user_id === currentUserId) ?? null
    : null

  return {
    ride_id: ride.id,
    title: ride.title,
    description: ride.description,
    start_location: ride.start_location,
    destination: ride.destination,
    ride_date: ride.ride_date,
    max_participants: ride.max_participants,
    participants_count: ride._count?.participants ?? (ride.participants?.length ?? 0),
    status: ride.status || 'upcoming',
    created_at: ride.created_at,
    is_joined: isJoined,
    join_request_status: joinRequest?.status ?? null,
    organizer: ride.organizer ? formatUser(ride.organizer, currentUserId) : null,
  }
}

module.exports = { userInclude, postInclude, rideInclude, formatUser, formatPost, formatRide }
