const express = require('express')
const { postInclude, userInclude, formatPost, formatUser } = require('../lib/helpers')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

function formatCommunity(community, currentUserId) {
  const membersCount = community._count?.members ?? (community.members?.length ?? 0)
  const isMember = currentUserId
    ? (community.members ?? []).some(m => m.user_id === currentUserId)
    : false

  return {
    community_id: community.id,
    name: community.name,
    description: community.description,
    cover_image_url: community.cover_image_url || null,
    category: community.category || null,
    members_count: membersCount,
    is_member: isMember,
    creator: community.creator ? formatUser(community.creator, currentUserId) : null,
    created_at: community.created_at,
  }
}

function communityInclude(currentUserId) {
  return {
    _count: { select: { members: true } },
    members: currentUserId ? { where: { user_id: currentUserId } } : false,
    creator: { include: { _count: { select: { followers: true, following: true, posts: true } } } },
  }
}

// GET /communities
router.get('/', authMiddleware, async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: communityInclude(req.user.id),
      orderBy: { created_at: 'desc' },
    })
    return res.json(communities.map(c => formatCommunity(c, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /communities
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, cover_image_url, category } = req.body
    if (!name || String(name).trim().length < 3) {
      return res.status(400).json({ detail: 'Community name must be at least 3 characters' })
    }
    if (!description || String(description).trim().length < 10) {
      return res.status(400).json({ detail: 'Community description must be at least 10 characters' })
    }

    const community = await prisma.community.create({
      data: {
        creator_id: req.user.id,
        name: String(name).trim(),
        description: String(description).trim(),
        cover_image_url: cover_image_url || null,
        category: category || null,
        members: { create: { user_id: req.user.id } },
      },
      include: communityInclude(req.user.id),
    })

    return res.status(201).json(formatCommunity(community, req.user.id))
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ detail: 'A community with this name already exists' })
    }
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /communities/:communityId
router.get('/:communityId', authMiddleware, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.communityId },
      include: communityInclude(req.user.id),
    })
    if (!community) return res.status(404).json({ detail: 'Community not found' })
    return res.json(formatCommunity(community, req.user.id))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /communities/:communityId/join — toggle
router.post('/:communityId/join', authMiddleware, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.communityId }
    })
    if (!community) return res.status(404).json({ detail: 'Community not found' })

    const existing = await prisma.communityMember.findUnique({
      where: { community_id_user_id: { community_id: community.id, user_id: req.user.id } }
    })

    if (existing) {
      await prisma.communityMember.delete({ where: { id: existing.id } })
      const count = await prisma.communityMember.count({ where: { community_id: community.id } })
      return res.json({ joined: false, members_count: count })
    }

    await prisma.communityMember.create({
      data: { community_id: community.id, user_id: req.user.id }
    })
    const count = await prisma.communityMember.count({ where: { community_id: community.id } })
    return res.json({ joined: true, members_count: count })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /communities/:communityId/posts — recent posts from community members
router.get('/:communityId/posts', authMiddleware, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.communityId },
      include: { members: { select: { user_id: true } } }
    })
    if (!community) return res.status(404).json({ detail: 'Community not found' })

    const memberIds = community.members.map(m => m.user_id)

    const posts = await prisma.post.findMany({
      where: { author_id: { in: memberIds } },
      include: postInclude(req.user.id),
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    return res.json(posts.map(p => formatPost(p, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
