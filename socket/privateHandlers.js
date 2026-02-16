const { Messages } = require("../modle/Message")
const {
    users,
    getUser
} = require("./userStore")

module.exports = function privateHandlers(io, socket) {

    // ================= PRIVATE MESSAGE =================
    socket.on("send-private-message", async ({ toUserId, message }) => {
        try {
            const recipient = getUser(toUserId)

            const newMessage = await Messages.create({
                fromUserId: socket.userId,
                toUserId,
                message
            })

            if (recipient) {
                io.to(recipient.socketId).emit("receive-private-message", {
                    fromUserId: socket.userId,
                    fromUsername: socket.username,
                    message,
                    timestamp: newMessage.createdAt
                })
            }

        } catch (err) {
            console.error("Private message error:", err)
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
