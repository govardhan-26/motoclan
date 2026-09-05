const express = require('express')
const { userInclude, postInclude, formatUser, formatPost } = require('../lib/helpers')
const { createNotification } = require('../lib/notify')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /users/:username/followers
router.get('/:username/followers', authMiddleware, async (req, res) => {
  try {
    const target = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: 'insensitive' } }
    })
    if (!target) return res.status(404).json({ detail: 'User not found' })

    const follows = await prisma.follow.findMany({
      where: { following_id: target.id },
      include: { follower: { include: userInclude(req.user.id) } }
    })

    return res.json(follows.map(f => formatUser(f.follower, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /users/:username/following
router.get('/:username/following', authMiddleware, async (req, res) => {
  try {
    const target = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: 'insensitive' } }
    })
    if (!target) return res.status(404).json({ detail: 'User not found' })

    const follows = await prisma.follow.findMany({
      where: { follower_id: target.id },
      include: { following: { include: userInclude(req.user.id) } }
    })

    return res.json(follows.map(f => formatUser(f.following, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /users/search?q=
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { full_name: { contains: q, mode: 'insensitive' } },
        ]
      },
      include: userInclude(req.user.id),
      take: 20,
    })

    return res.json(users.map(u => formatUser(u, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /users/:username/posts
router.get('/:username/posts', authMiddleware, async (req, res) => {
  try {
    const target = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: 'insensitive' } }
    })
    if (!target) return res.status(404).json({ detail: 'User not found' })

    const posts = await prisma.post.findMany({
      where: { author_id: target.id },
      include: postInclude(req.user.id),
      orderBy: { created_at: 'desc' },
    })

    return res.json(posts.map(p => formatPost(p, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /users/:username
router.get('/:username', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: 'insensitive' } },
      include: userInclude(req.user.id),
    })
    if (!user) return res.status(404).json({ detail: 'User not found' })
    return res.json(formatUser(user, req.user.id))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// PUT /users/me
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'full_name', 'bio', 'location', 'profile_image_url',
      'motorcycle_details', 'riding_experience_years',
    ]
    const data = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field]
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: { _count: { select: { followers: true, following: true, posts: true } } }
    })

    return res.json(formatUser(user, null))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /users/:username/follow — toggle follow/unfollow
router.post('/:username/follow', authMiddleware, async (req, res) => {
  try {
    const target = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: 'insensitive' } }
    })
    if (!target) return res.status(404).json({ detail: 'User not found' })
    if (target.id === req.user.id) return res.status(400).json({ detail: 'You cannot follow yourself' })

    const existing = await prisma.follow.findUnique({
      where: { follower_id_following_id: { follower_id: req.user.id, following_id: target.id } }
    })

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } })
      return res.json({ following: false })
    }

    await prisma.follow.create({
      data: { follower_id: req.user.id, following_id: target.id }
    })

    const actor = await prisma.user.findUnique({ where: { id: req.user.id } })
    createNotification({
      user_id: target.id,
      actor_id: req.user.id,
      type: 'follow',
      content: `${actor.full_name} started following you`,
      link: `/profile/${actor.username}`,
    }).catch(console.error)

    return res.json({ following: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
