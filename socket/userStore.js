// In-memory store for online users

const users = new Map()

function addUser(userId, socketId, username) {
    users.set(userId, {
        socketId,
        username,
        connectedAt: new Date()
    })
}

function removeUser(userId) {
    users.delete(userId)
}

function getUser(userId) {
    return users.get(userId)
}

function hasUser(userId) {
    return users.has(userId)
}

function getAllUsers() {
    return Array.from(users.entries()).map(([userId, data]) => ({
        userId,
        socketId: data.socketId,
        username: data.username
    }))
}

module.exports = {
    users,
    addUser,
    removeUser,
    getUser,
    hasUser,
    getAllUsers
}
