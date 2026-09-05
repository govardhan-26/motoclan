const express = require('express')
const { userInclude, formatUser } = require('../lib/helpers')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

function formatNotification(notif) {
  return {
    notification_id: notif.id,
    type: notif.type,
    actor: notif.actor
      ? formatUser(notif.actor, null)
      : null,
    content: notif.content,
    created_at: notif.created_at,
    is_read: notif.is_read,
    link: notif.link || null,
  }
}

// GET /notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      include: {
        actor: {
          include: { _count: { select: { followers: true, following: true, posts: true } } }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    })
    return res.json(notifications.map(formatNotification))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// PUT /notifications/read-all — MUST be before /:notificationId
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true },
    })
    return res.json({ updated: result.count })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// PUT /notifications/:notificationId/read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: { id: req.params.notificationId, user_id: req.user.id }
    })
    if (!notif) return res.status(404).json({ detail: 'Notification not found' })

    await prisma.notification.update({
      where: { id: notif.id },
      data: { is_read: true },
    })
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
