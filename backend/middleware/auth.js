const { decodeToken } = require('../lib/security')

function authMiddleware(req, res, next) {
  let token = null

  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  // Query param fallback for EventSource (SSE cannot send custom headers)
  if (!token && req.query.token) {
    token = req.query.token
  }

  if (!token) {
    return res.status(401).json({ detail: 'Invalid or expired token' })
  }

  try {
    const decoded = decodeToken(token)
    req.user = { id: decoded.sub }
    next()
  } catch {
    return res.status(401).json({ detail: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
