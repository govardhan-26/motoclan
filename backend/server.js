require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { addClient, removeClient } = require('./lib/sse')
const authMiddleware = require('./middleware/auth')

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/users'))
app.use('/', require('./routes/feed'))
app.use('/rides', require('./routes/rides'))
app.use('/communities', require('./routes/communities'))
app.use('/messages', require('./routes/messages'))
app.use('/notifications', require('./routes/notifications'))

// SSE — persistent push channel per logged-in user
app.get('/events', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const userId = req.user.id
  addClient(userId, res)

  const ping = setInterval(() => {
    try { res.write(':ping\n\n') } catch { clearInterval(ping) }
  }, 20000)

  req.on('close', () => {
    clearInterval(ping)
    removeClient(userId)
  })
})

app.get('/', (req, res) => {
  res.json({ message: 'Moto Clan API', version: '2.0.0' })
})

app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.path} not found` })
})

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ detail: 'Internal server error' })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Moto Clan API running on http://localhost:${PORT}`)
})
