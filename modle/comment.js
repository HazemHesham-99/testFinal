const { required } = require("joi")
const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    postId: { type: mongoose.Types.ObjectId, ref: "Posts", required: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: "users" }]
},
    { timestamps: true }
)

const Comment = mongoose.model("Comments", commentSchema)

module.exports = { Comment }