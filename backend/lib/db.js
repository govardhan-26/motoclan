const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'db.json')

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

module.exports = { readDb, writeDb }
