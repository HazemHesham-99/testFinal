const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'users', // Matches your User model collection name
        required: true
    },
    toUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
   
}, {
    timestamps: true
})

const Messages = mongoose.model("Messages", MessageSchema)


module.exports = { Messages }