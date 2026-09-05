const express = require('express')
const { userInclude, formatUser } = require('../lib/helpers')
const { createNotification } = require('../lib/notify')
const { pushToUser } = require('../lib/sse')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

function formatMessage(msg, currentUserId) {
  return {
    message_id: msg.id,
    sender: msg.sender ? formatUser(msg.sender, currentUserId) : null,
    content: msg.content,
    created_at: msg.created_at,
    is_read: msg.is_read,
  }
}

// GET /messages — list conversations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id

    const messages = await prisma.message.findMany({
      where: { OR: [{ sender_id: myId }, { recipient_id: myId }] },
      include: {
        sender: { include: userInclude(myId) },
        recipient: { include: userInclude(myId) },
      },
      orderBy: { created_at: 'desc' },
    })

    const convMap = new Map()
    for (const msg of messages) {
      const otherId = msg.sender_id === myId ? msg.recipient_id : msg.sender_id
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          partner: msg.sender_id === myId ? msg.recipient : msg.sender,
          lastMessage: msg,
          unreadCount: 0,
        })
      }
      if (msg.sender_id !== myId && !msg.is_read) {
        convMap.get(otherId).unreadCount++
      }
    }

    const conversations = [...convMap.values()].map(conv => ({
      conversation_id: conv.partner.id,
      participant: formatUser(conv.partner, myId),
      last_message: formatMessage(conv.lastMessage, myId),
      unread_count: conv.unreadCount,
    }))

    return res.json(conversations)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// GET /messages/:otherUserId — get thread
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id
    const otherId = req.params.otherUserId

    const other = await prisma.user.findUnique({ where: { id: otherId } })
    if (!other) return res.status(404).json({ detail: 'User not found' })

    // Mark messages from other user as read
    await prisma.message.updateMany({
      where: { sender_id: otherId, recipient_id: myId, is_read: false },
      data: { is_read: true },
    })

    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: myId, recipient_id: otherId },
          { sender_id: otherId, recipient_id: myId },
        ]
      },
      include: { sender: { include: userInclude(myId) } },
      orderBy: { created_at: 'asc' },
    })

    return res.json(thread.map(m => formatMessage(m, myId)))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

// POST /messages/:otherUserId — send message
router.post('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body
    const myId = req.user.id
    const otherId = req.params.otherUserId

    const other = await prisma.user.findUnique({ where: { id: otherId } })
    if (!other) return res.status(404).json({ detail: 'User not found' })
    if (!content || String(content).trim().length < 1) {
      return res.status(400).json({ detail: 'Message content cannot be empty' })
    }

    const msg = await prisma.message.create({
      data: {
        sender_id: myId,
        recipient_id: otherId,
        content: String(content).trim(),
        is_read: false,
      },
      include: { sender: { include: userInclude(myId) } },
    })

    pushToUser(otherId, 'new_message', { from_user_id: myId })

    // Notify only if no existing unread message notification from this sender
    const recentNotif = await prisma.notification.findFirst({
      where: { user_id: otherId, actor_id: myId, type: 'message', is_read: false }
    })
    if (!recentNotif) {
      const sender = await prisma.user.findUnique({ where: { id: myId } })
      createNotification({
        user_id: otherId,
        actor_id: myId,
        type: 'message',
        content: 'sent you a message',
        link: `/messages/${sender.username}`,
      }).catch(console.error)
    }

    return res.status(201).json(formatMessage(msg, myId))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
