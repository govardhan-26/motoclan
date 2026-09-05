const express = require('express')
const { hashPassword, verifyPassword, createAccessToken, createRefreshToken, decodeToken } = require('../lib/security')
const { formatUser } = require('../lib/helpers')
const authMiddleware = require('../middleware/auth')
const prisma = require('../lib/prisma')

const router = express.Router()

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, phone_number, password, username, full_name } = req.body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ detail: 'Invalid email format' })
    }
    if (!phone_number) {
      return res.status(400).json({ detail: 'Phone number is required' })
    }
    let rawPhone = String(phone_number).trim().replace(/\s+/g, '')
    if (rawPhone.startsWith('+91')) rawPhone = rawPhone.slice(3)
    else if (rawPhone.startsWith('91') && rawPhone.length === 12) rawPhone = rawPhone.slice(2)
    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      return res.status(400).json({ detail: 'Phone number must be a valid 10-digit Indian mobile number (starting with 6-9)' })
    }
    const normalizedPhone = '+91' + rawPhone

    if (!password || String(password).length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters' })
    }
    if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ detail: 'Username must be 3-30 characters (letters, numbers, underscores)' })
    }
    if (!full_name || String(full_name).trim().length < 2) {
      return res.status(400).json({ detail: 'Full name must be at least 2 characters' })
    }

    const emailLower = email.toLowerCase().trim()

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { username: { equals: username, mode: 'insensitive' } },
          { phone_number: normalizedPhone },
        ]
      }
    })

    if (existing) {
      if (existing.email === emailLower) return res.status(400).json({ detail: 'An account with this email already exists' })
      if (existing.phone_number === normalizedPhone) return res.status(400).json({ detail: 'An account with this phone number already exists' })
      return res.status(400).json({ detail: 'Username is already taken' })
    }

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        phone_number: normalizedPhone,
        password_hash: hashPassword(password),
        username: username.trim(),
        full_name: full_name.trim(),
      }
    })

    return res.status(201).json({
      user_id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      username: user.username,
      full_name: user.full_name,
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ detail: 'Registration failed' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(401).json({ detail: 'Invalid email or password' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ detail: 'Invalid email or password' })
    }

    const payload = { sub: user.id }
    const accessToken = createAccessToken(payload)
    const refreshToken = createRefreshToken(payload)

    await prisma.refreshToken.create({
      data: { token: refreshToken, user_id: user.id }
    })

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ detail: 'Login failed' })
  }
})

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) return res.status(400).json({ detail: 'Refresh token required' })

    let decoded
    try {
      decoded = decodeToken(refresh_token)
    } catch {
      return res.status(401).json({ detail: 'Invalid or expired refresh token' })
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refresh_token }
    })
    if (!stored || stored.user_id !== decoded.sub) {
      return res.status(401).json({ detail: 'Refresh token not recognised' })
    }

    const newAccessToken = createAccessToken({ sub: decoded.sub })
    return res.json({ access_token: newAccessToken })
  } catch (err) {
    console.error('Refresh error:', err)
    return res.status(500).json({ detail: 'Token refresh failed' })
  }
})

// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { _count: { select: { followers: true, following: true, posts: true } } }
    })
    if (!user) return res.status(404).json({ detail: 'User not found' })
    return res.json(formatUser(user, null))
  } catch (err) {
    console.error('Me error:', err)
    return res.status(500).json({ detail: 'Server error' })
  }
})

module.exports = router
