const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { Comment } = require("../modle/comment")
const { exist } = require("joi")
const { Post } = require("../modle/Posts")
const { getUser } = require("../socket/userStore")
const { Notification } = require("../modle/Notification")



const router = express.Router()



router.post("/createComment/:postId", authMiddleware, async function (req, res) {
    try {
        //get user id
        const userId = req.user.id

        //get post id
        const postId = req.params.postId
        // check if post exist
        if (!(await Post.findById(postId))) {
            return res.status(400).json({ message: "post does not exist" })
        }
        //get caption
        const text = req.body.text
        if (!text) {
            return res.status(400).json({ message: "can not create comment with empty text" })
        }

        const newcomment = await Comment.create({ text, postId, userId })

        // populate postId to use it in notification to get post owner
        const comment = await Comment.findById(newcomment._id).populate('userId', 'profilePic name')  .populate('postId', 'userId') 

        if (comment.userId.toString() !== userId.toString()) {


            // Find recipient's socket
            const postOwnerId = comment.userId._id.toString()
            const recipient = getUser(postOwnerId)

            if (recipient && recipient.socket && recipient.socket.notificationHelpers) {
                console.log('📢 Creating comment notification via socket')

                // Create notification using socket helpers
                await recipient.socket.notificationHelpers.createNotification(
                    comment.postId.userId,  // recipient (post owner)
                    {
                        type: 'COMMENT',
                        message: `${req.user.username} commented on your post`,
                        postId: comment.postId._id,
                        sender: userId
                    }
                )
            } else {
                // If recipient offline, still save notification
                console.log('💾 User offline, saving notification to database')

                await Notification.create({
                    recipient:  comment.userId._id,
                    sender: userId,
                    type: 'COMMENT',
                    message: `${req.user.username} commented on your post`,
                    postId: comment.postId,
                    isRead: false
                })
            }

        }

        res.status(201).json({ message: "comment created", comment })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

router.put("/:id/update", authMiddleware, async function (req, res) {
    try {

        const userId = req.user.id
        const commentId = req.params.id
        const text = req.body.text

        const comment = await Comment.findOneAndUpdate(
            { userId, _id: commentId },
            { text },
            { new: true }
        )

        if (!comment) {
            res.status(403).json({ message: "not allowd to edit" })

        }

        res.status(201).json({ message: "comment created", comment })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

router.delete("/:id", authMiddleware, async function (req, res) {
    try {

        const userId = req.user.id
        const commentId = req.params.id


        const comment = await Comment.findOneAndDelete({ userId, _id: commentId },)
        if (!comment) {
            return res.status(400).json({ message: "comment does not exist" })
        }

        res.status(203).json({ message: "comment deleted" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router