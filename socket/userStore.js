// In-memory store for online users

const users = new Map()

function addUser(userId, socket, username) {   
    users.set(userId, {
        socket: socket,
        socketId: socket.id,
        username,
        connectedAt: new Date()
    })
}

function removeUser(userId) {
    users.delete(userId)
}

function getUser(userId) {
    if (!userId) return null

    const userIdStr = userId.toString()
    const user = users.get(userIdStr)

    if (user) {
        // IMPORTANT: Return the FULL user object with socket
        return user
    }

    console.log(`❌ User ${userIdStr} NOT found in store`)
    return null
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

//use it at index while configuration
module.exports = {
    users,
    addUser,
    removeUser,
    getUser,
    hasUser,
    getAllUsers
}
