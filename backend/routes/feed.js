const express = require('express')
const { postInclude, userInclude, formatPost, formatUser } = require('../lib/helpers')
const { createNotification } = require('../lib/notify')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

// GET /feed
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)

    const posts = await prisma.post.findMany({
      include: postInclude(req.user.id),
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    })

    return res.json(posts.map(p => formatPost(p, req.user.id)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /posts
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { content, media_urls } = req.body
    if (!content || String(content).trim().length < 1) {
      return res.status(400).json({ detail: 'Post content cannot be empty' })
    }
    if (String(content).trim().length > 2000) {
      return res.status(400).json({ detail: 'Post content cannot exceed 2000 characters' })
    }

    const post = await prisma.post.create({
      data: {
        author_id: req.user.id,
        content: String(content).trim(),
        media_urls: Array.isArray(media_urls) ? media_urls : [],
      },
      include: postInclude(req.user.id),
    })

    return res.status(201).json(formatPost(post, req.user.id))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /posts/:postId
router.get('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
      include: postInclude(req.user.id),
    })
    if (!post) return res.status(404).json({ detail: 'Post not found' })
    return res.json(formatPost(post, req.user.id))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /posts/:postId/like — toggle
router.post('/posts/:postId/like', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } })
    if (!post) return res.status(404).json({ detail: 'Post not found' })

    const existing = await prisma.postLike.findUnique({
      where: { post_id_user_id: { post_id: post.id, user_id: req.user.id } }
    })

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } })
      const count = await prisma.postLike.count({ where: { post_id: post.id } })
      return res.json({ liked: false, likes_count: count })
    }

    await prisma.postLike.create({ data: { post_id: post.id, user_id: req.user.id } })

    if (post.author_id !== req.user.id) {
      const actor = await prisma.user.findUnique({ where: { id: req.user.id } })
      createNotification({
        user_id: post.author_id,
        actor_id: req.user.id,
        type: 'like',
        content: `${actor.full_name} liked your post`,
        link: `/posts/${post.id}`,
      }).catch(console.error)
    }

    const count = await prisma.postLike.count({ where: { post_id: post.id } })
    return res.json({ liked: true, likes_count: count })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// DELETE /posts/:postId
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } })
    if (!post) return res.status(404).json({ detail: 'Post not found' })
    if (post.author_id !== req.user.id) return res.status(403).json({ detail: 'You can only delete your own posts' })

    // Prisma cascades likes + comments via onDelete: Cascade in schema
    await prisma.post.delete({ where: { id: post.id } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /posts/:postId/comments
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } })
    if (!post) return res.status(404).json({ detail: 'Post not found' })
    if (!content || String(content).trim().length < 1) {
      return res.status(400).json({ detail: 'Comment content cannot be empty' })
    }

    const comment = await prisma.comment.create({
      data: {
        post_id: post.id,
        author_id: req.user.id,
        content: String(content).trim(),
      },
      include: { author: { include: { _count: { select: { followers: true, following: true, posts: true } } } } }
    })

    if (post.author_id !== req.user.id) {
      const actor = await prisma.user.findUnique({ where: { id: req.user.id } })
      createNotification({
        user_id: post.author_id,
        actor_id: req.user.id,
        type: 'comment',
        content: `${actor.full_name} commented on your post`,
        link: `/posts/${post.id}`,
      }).catch(console.error)
    }

    return res.status(201).json({
      comment_id: comment.id,
      post_id: comment.post_id,
      author: formatUser(comment.author, req.user.id),
      content: comment.content,
      created_at: comment.created_at,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /posts/:postId/comments
router.get('/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } })
    if (!post) return res.status(404).json({ detail: 'Post not found' })

    const comments = await prisma.comment.findMany({
      where: { post_id: post.id },
      include: { author: { include: { _count: { select: { followers: true, following: true, posts: true } } } } },
      orderBy: { created_at: 'asc' },
    })

    return res.json(comments.map(c => ({
      comment_id: c.id,
      post_id: c.post_id,
      author: formatUser(c.author, req.user.id),
      content: c.content,
      created_at: c.created_at,
    })))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
