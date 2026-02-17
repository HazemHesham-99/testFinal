const { createNotification } = require("../utils/notificationService")
const { getUser } = require("./userStore")

module.exports = function notificationHandlers(io, socket) {

    // 🔔 Send notification helper
    async function sendNotification(data) {

        const notification = await createNotification(data)

        const receiverSocketId = getUser(data.recipient)

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification:new", notification)
        }
    }

    // Example events
    socket.on("notify:like", async ({ postOwnerId, postId }) => {
        await sendNotification({
            recipient: postOwnerId,
            sender: socket.userId,
            type: "LIKE",
            postId
        })
    })

    socket.on("notify:comment", async ({ postOwnerId, postId }) => {
        await sendNotification({
            recipient: postOwnerId,
            sender: socket.userId,
            type: "COMMENT",
            postId
        })
    })

    socket.on("notify:message", async ({ receiverId, message }) => {
        await sendNotification({
            recipient: receiverId,
            sender: socket.userId,
            type: "MESSAGE",
            message
        })
    })
}
