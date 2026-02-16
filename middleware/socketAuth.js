const jwt = require("jsonwebtoken")
const { User } = require("../modle/user")

module.exports = async function socketAuth(socket, next) {
    try {
        const token = socket.handshake.auth?.token

        if (!token) {
            return next(new Error("No token provided"))
        }

        let cleanToken = token
        if (token.startsWith("Bearer ")) {
            cleanToken = token.split(" ")[1]
        }

        const payload = jwt.verify(cleanToken, process.env.JWT_SECRET)

        const user = await User.findById(payload.id)
            .select("_id username name email")

        if (!user) {
            return next(new Error("User not found"))
        }

        socket.user = user.toObject()
        socket.userId = user._id.toString()
        socket.username = user.username || user.name

        next()

    } catch (err) {
        next(new Error("Authentication failed"))
    }
}
