const express = require('express')
const { rideInclude, userInclude, formatRide, formatUser } = require('../lib/helpers')
const { createNotification } = require('../lib/notify')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

async function getNetworkIds(userId) {
  const [following, followers] = await Promise.all([
    prisma.follow.findMany({ where: { follower_id: userId }, select: { following_id: true } }),
    prisma.follow.findMany({ where: { following_id: userId }, select: { follower_id: true } }),
  ])
  const ids = new Set([
    ...following.map(f => f.following_id),
    ...followers.map(f => f.follower_id),
  ])
  ids.delete(userId)
  return [...ids]
}

// GET /rides/feed — rides by your network
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id
    const networkIds = await getNetworkIds(myId)
    const q = (req.query.q || '').toLowerCase().trim()

    const where = { organizer_id: { in: networkIds } }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { start_location: { contains: q, mode: 'insensitive' } },
        { destination: { contains: q, mode: 'insensitive' } },
      ]
    }

    const rides = await prisma.ride.findMany({
      where,
      include: rideInclude(myId),
      orderBy: { ride_date: 'asc' },
    })

    return res.json(rides.map(r => formatRide(r, myId)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /rides/explore — rides outside your network
router.get('/explore', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id
    const networkIds = await getNetworkIds(myId)
    const excludeIds = [...networkIds, myId]
    const q = (req.query.q || '').toLowerCase().trim()

    const where = { organizer_id: { notIn: excludeIds } }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { start_location: { contains: q, mode: 'insensitive' } },
        { destination: { contains: q, mode: 'insensitive' } },
      ]
    }

    const rides = await prisma.ride.findMany({
      where,
      include: rideInclude(myId),
      orderBy: { ride_date: 'asc' },
    })

    return res.json(rides.map(r => formatRide(r, myId)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /rides/mine — rides I'm participating in
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id

    const participations = await prisma.rideParticipant.findMany({
      where: { user_id: myId },
      select: { ride_id: true },
    })
    const rideIds = participations.map(p => p.ride_id)

    const rides = await prisma.ride.findMany({
      where: { id: { in: rideIds } },
      include: rideInclude(myId),
      orderBy: { ride_date: 'asc' },
    })

    return res.json(rides.map(r => formatRide(r, myId)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /rides — create
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, start_location, destination, ride_date, max_participants, invited_user_ids } = req.body
    const myId = req.user.id

    if (!title || String(title).trim().length < 3)
      return res.status(400).json({ detail: 'Title must be at least 3 characters' })
    if (!start_location || !destination)
      return res.status(400).json({ detail: 'Start location and destination are required' })
    if (!ride_date)
      return res.status(400).json({ detail: 'Ride date is required' })
    if (!max_participants || parseInt(max_participants, 10) < 1)
      return res.status(400).json({ detail: 'Max participants must be at least 1' })

    const ride = await prisma.ride.create({
      data: {
        organizer_id: myId,
        title: String(title).trim(),
        description: description ? String(description).trim() : '',
        start_location: String(start_location).trim(),
        destination: String(destination).trim(),
        ride_date,
        max_participants: parseInt(max_participants, 10),
        status: 'upcoming',
        participants: { create: { user_id: myId } },
      },
      include: rideInclude(myId),
    })

    // Notify network (fire and forget)
    const networkIds = await getNetworkIds(myId)
    const actor = await prisma.user.findUnique({ where: { id: myId } })
    networkIds.forEach(userId => {
      createNotification({
        user_id: userId,
        actor_id: myId,
        type: 'ride_created',
        content: `${actor.full_name} created a new ride: ${ride.title}`,
        link: `/rides/${ride.id}`,
      }).catch(console.error)
    })

    // Send invites (fire and forget)
    if (Array.isArray(invited_user_ids)) {
      invited_user_ids
        .filter(id => id !== myId)
        .forEach(invitedId => {
          createNotification({
            user_id: invitedId,
            actor_id: myId,
            type: 'ride_invite',
            content: `${actor.full_name} invited you to join their ride: ${ride.title}`,
            link: `/rides/${ride.id}`,
          }).catch(console.error)
        })
    }

    return res.status(201).json(formatRide(ride, myId))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /rides/:rideId/requests — pending requests (organizer only)
router.get('/:rideId/requests', authMiddleware, async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({ where: { id: req.params.rideId } })
    if (!ride) return res.status(404).json({ detail: 'Ride not found' })
    if (ride.organizer_id !== req.user.id)
      return res.status(403).json({ detail: 'Only the organizer can view requests' })

    const requests = await prisma.rideJoinRequest.findMany({
      where: { ride_id: ride.id, status: 'pending' },
      include: { user: { include: userInclude(req.user.id) } },
      orderBy: { created_at: 'desc' },
    })

    return res.json(requests.map(r => ({
      request_id: r.id,
      user: formatUser(r.user, req.user.id),
      status: r.status,
      created_at: r.created_at,
    })))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// PUT /rides/:rideId/requests/:requestId — approve or reject
router.put('/:rideId/requests/:requestId', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body
    if (!['approve', 'reject'].includes(action))
      return res.status(400).json({ detail: 'Action must be approve or reject' })

    const ride = await prisma.ride.findUnique({
      where: { id: req.params.rideId },
      include: { _count: { select: { participants: true } } }
    })
    if (!ride) return res.status(404).json({ detail: 'Ride not found' })
    if (ride.organizer_id !== req.user.id)
      return res.status(403).json({ detail: 'Not authorized' })

    const joinRequest = await prisma.rideJoinRequest.findFirst({
      where: { id: req.params.requestId, ride_id: ride.id }
    })
    if (!joinRequest) return res.status(404).json({ detail: 'Request not found' })

    if (action === 'approve') {
      if (ride._count.participants >= ride.max_participants)
        return res.status(400).json({ detail: 'Ride is full' })

      await prisma.rideParticipant.create({
        data: { ride_id: ride.id, user_id: joinRequest.user_id }
      })

      createNotification({
        user_id: joinRequest.user_id,
        actor_id: req.user.id,
        type: 'ride_request_approved',
        content: `approved your request to join: ${ride.title}`,
        link: `/rides/${ride.id}`,
      }).catch(console.error)
    } else {
      createNotification({
        user_id: joinRequest.user_id,
        actor_id: req.user.id,
        type: 'ride_request_rejected',
        content: `declined your request to join: ${ride.title}`,
        link: `/rides/${ride.id}`,
      }).catch(console.error)
    }

    await prisma.rideJoinRequest.update({
      where: { id: joinRequest.id },
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
    })

    const participantsCount = await prisma.rideParticipant.count({ where: { ride_id: ride.id } })
    return res.json({ ok: true, action, participants_count: participantsCount })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /rides/:rideId/request-join
router.post('/:rideId/request-join', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.rideId },
      include: { _count: { select: { participants: true } } }
    })
    if (!ride) return res.status(404).json({ detail: 'Ride not found' })
    if (ride.organizer_id === myId)
      return res.status(400).json({ detail: 'You are the organizer of this ride' })
    if (ride._count.participants >= ride.max_participants)
      return res.status(400).json({ detail: 'Ride is full' })

    const isParticipant = await prisma.rideParticipant.findUnique({
      where: { ride_id_user_id: { ride_id: ride.id, user_id: myId } }
    })
    if (isParticipant) return res.status(400).json({ detail: 'Already a participant' })

    const existingRequest = await prisma.rideJoinRequest.findUnique({
      where: { ride_id_user_id: { ride_id: ride.id, user_id: myId } }
    })
    if (existingRequest?.status === 'pending')
      return res.status(400).json({ detail: 'Already have a pending request' })

    let newRequest
    if (existingRequest) {
      newRequest = await prisma.rideJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: 'pending' },
      })
    } else {
      newRequest = await prisma.rideJoinRequest.create({
        data: { ride_id: ride.id, user_id: myId, status: 'pending' }
      })
    }

    createNotification({
      user_id: ride.organizer_id,
      actor_id: myId,
      type: 'ride_request',
      content: `wants to join your ride: ${ride.title}`,
      link: `/rides/${ride.id}`,
    }).catch(console.error)

    return res.json({ request_id: newRequest.id, status: 'pending' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /rides/:rideId/cancel-request
router.post('/:rideId/cancel-request', authMiddleware, async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({ where: { id: req.params.rideId } })
    if (!ride) return res.status(404).json({ detail: 'Ride not found' })

    const existing = await prisma.rideJoinRequest.findUnique({
      where: { ride_id_user_id: { ride_id: ride.id, user_id: req.user.id } }
    })
    if (!existing || existing.status !== 'pending')
      return res.status(404).json({ detail: 'No pending request found' })

    await prisma.rideJoinRequest.delete({ where: { id: existing.id } })
    return res.json({ ok: true, status: null })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /rides/:rideId — single ride
router.get('/:rideId', authMiddleware, async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.rideId },
      include: rideInclude(req.user.id),
    })
    if (!ride) return res.status(404).json({ detail: 'Ride not found' })
    return res.json(formatRide(ride, req.user.id))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /rides — all rides
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      include: rideInclude(req.user.id),
      orderBy: { ride_date: 'asc' },
    })
    return res.json(rides.map(r => formatRide(r, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
