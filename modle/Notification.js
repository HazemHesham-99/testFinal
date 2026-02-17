const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    type: {
        type: String,
        enum: ["LIKE", "COMMENT", "MESSAGE"],
        required: true
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    message: {
        type: String
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

 const Notification = mongoose.model("Notification", notificationSchema)

module.exports = Notification
