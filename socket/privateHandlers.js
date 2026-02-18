const { Messages } = require("../modle/Message")
const {
    users,
    getUser
} = require("./userStore")

module.exports = function privateHandlers(io, socket) {
    const { userId, username } = socket

    // Get current user info - ADD THIS
    socket.on('get-current-user', () => {
        console.log(`📋 User ${userId} requested current user info`)
        socket.emit('current-user', {
            userId,
            username
        })
    })

    // Get online users - ADD THIS (useful for refreshing)
    socket.on('get-online-users', () => {
        const { getAllUsers } = require('./userStore')
        const onlineUsers = getAllUsers().filter(u => u.userId !== userId)
        socket.emit('online-users-list', onlineUsers)
    })

    // ===== SEND PRIVATE MESSAGE =====

    socket.on("send-private-message", async ({ toUserId, message }) => {
        try {
            const recipient = getUser(toUserId)

            // Save message to database
            const newMessage = await Messages.create({
                fromUserId: socket.userId,
                toUserId,
                message
            })


            // Send message to recipient if online
            if (recipient) {
                io.to(recipient.socketId).emit("receive-private-message", {
                    fromUserId: socket.userId,
                    fromUsername: socket.username,
                    message,
                    timestamp: newMessage.createdAt
                })

                // ===== CREATE MESSAGE NOTIFICATION =====

                if (recipient.socket && recipient.socket.notificationHelpers) {

                    try {
                        const notif = await recipient.socket.notificationHelpers.createNotification(toUserId, {
                            type: 'MESSAGE',
                            message: `${socket.username} sent you a message: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
                            postId: null,
                            sender: socket.userId,
                            senderUsername: socket.username

                        })

                    } catch (notifError) {
                        console.error('❌ Error in createNotification:', notifError)
                    }
                } else {

                    if (socket.notificationHelpers) {
                        const notif = await socket.notificationHelpers.createNotification(toUserId, {
                            type: 'MESSAGE',
                            message: `${socket.username} sent you a message: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
                            postId: null,
                            sender: socket.userId
                        })
                    }
                }
            } else {
                // offline user for future work
                if (socket.notificationHelpers) {
                    await socket.notificationHelpers.createNotification(toUserId, {
                        type: 'MESSAGE',
                        message: `${socket.username} sent you a message: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
                        postId: null,
                        sender: socket.userId
                    })
                }
            }

        } catch (err) {
            console.error("❌ Private message error:", err)
        }
    })

    // ================= HISTORY =================
    socket.on("load-private-history", async ({ otherUserId }) => {
        try {
            const messages = await Messages.find({
                $or: [
                    { fromUserId: socket.userId, toUserId: otherUserId },
                    { fromUserId: otherUserId, toUserId: socket.userId }
                ]
            }).sort({ createdAt: 1 })

            socket.emit("private-history", {
                userId: otherUserId,
                messages,
                fromUser: socket.userId
            })

        } catch (err) {
            console.error("History error:", err)
        }
    })

}


