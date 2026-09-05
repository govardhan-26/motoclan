const { pushToUser } = require('./sse')
const prisma = require('./prisma')

async function createNotification({ user_id, actor_id, type, content, link }) {
  const notif = await prisma.notification.create({
    data: {
      user_id,
      actor_id: actor_id || null,
      type,
      content,
      link: link || null,
      is_read: false,
    }
  })
  pushToUser(user_id, 'new_notification', { type })
  return notif
}

module.exports = { createNotification }
