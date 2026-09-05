// SSE client registry — maps userId (string) → Express response stream
const clients = new Map()

function addClient(userId, res) {
  clients.set(userId, res)
}

function removeClient(userId) {
  clients.delete(userId)
}

// Push a named SSE event to one user. Silent if they have no open connection.
function pushToUser(userId, event, data = {}) {
  const res = clients.get(userId)
  if (!res) return
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  } catch {
    clients.delete(userId)
  }
}

module.exports = { addClient, removeClient, pushToUser }
