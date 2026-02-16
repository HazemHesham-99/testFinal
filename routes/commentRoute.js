const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { Comment } = require("../modle/comment")
const { exist } = require("joi")
const { Post } = require("../modle/Posts")



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
        const comment = await Comment.findById(newcomment._id).populate('userId', 'profilePic name')


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