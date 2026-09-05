const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const SECRET = process.env.JWT_SECRET || 'moto-clan-india-secret-key-change-in-prod-2024'
const ACCESS_EXPIRES = '1h'
const REFRESH_EXPIRES = '30d'

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash)
}

function createAccessToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES })
}

function createRefreshToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRES })
}

function decodeToken(token) {
  return jwt.verify(token, SECRET)
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  decodeToken
}
