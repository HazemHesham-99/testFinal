const { Server } = require("socket.io")

const privateHandlers = require("./privateHandlers")

const {
    users,
    addUser,
    removeUser,
    getUser,
    hasUser,
    getAllUsers
} = require("./userStore")
const socketAuth = require("../middleware/socketAuth")

module.exports = function initSocket(server) {

    const io = new Server(server, {
        cors: {
            origin: JSON.parse(process.env.PRODUCTION)
                ? process.env.CLIENT_ORIGIN
                : "*",
            methods: ["GET", "POST"]
        }
    })

    // ===== AUTH MIDDLEWARE =====
    io.use(socketAuth)

    // ===== CONNECTION =====
    io.on("connection", (socket) => {

        const { userId, username } = socket

        // ===== SINGLE SOCKET PER USER =====
        if (hasUser(userId)) {
            const oldSocketId = getUser(userId).socketId
            const oldSocket = io.sockets.sockets.get(oldSocketId)

            if (oldSocket && oldSocket.id !== socket.id) {
                oldSocket.disconnect(true)
            }
        }

        // ===== SAVE USER in RAM =====
        addUser(userId, socket.id, username)

        // ===== CONNECT EVENT =====
        socket.emit("chat:connected", {
            userId,
            username
        })

        // ===== SEND ONLINE USERS =====
        const onlineUsers = getAllUsers().filter(u => u.userId !== userId)
        socket.emit("online-users-list", onlineUsers)

        socket.broadcast.emit("user:joined", {
            userId,
            socketId: socket.id,
            username
        })

        // ===== LOAD PRIVATE EVENTS =====
        privateHandlers(io, socket)

        // ===== DISCONNECT =====
        socket.on("disconnect", () => {

            const user = getUser(userId)

            if (user && user.socketId === socket.id) {
                removeUser(userId)

                socket.broadcast.emit("user:left", {
                    userId,
                    username
                })
            }
        })
    })
}
