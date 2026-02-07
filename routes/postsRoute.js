const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { upload } = require("../utils/upload")
const { Post } = require("../modle/Posts")
const { Comment } = require("../modle/comment")
const { User } = require("../modle/user")


const router = express.Router()

// create post
router.post("/createPost", authMiddleware, upload.array("photos", 3), async function (req, res) {
    try {
        //get user id
        const userId = req.user.id
        console.log(req.files)
        // get photos
        const images = req.files.map(iteam => iteam.path)
        console.log(images)
        //get caption
        const caption = req.body.caption
        if (!caption) {
            return res.status(400).json({ message: "can not create post with empty caption" })
        }

        const post = await Post.create({ caption, images, userId })

        res.status(201).json({ message: "post created", post })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

//get all posts
router.get("/", async function (req, res) {
    try {

        const page = parseInt(req.query.page) || 1;      // Default: page 1
        const limit = parseInt(req.query.limit) || 10;   // Default: 10 posts per page

        // Calculate skip value for skip
        const skip = (page - 1) * limit;


        const posts = await Post.find()
            .populate("userId", "name profilePic")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        // Get total count of posts (for calculating total pages)
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);


        res.json({ message: "post fetched", posts, page:{totalPages,page,limit} })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

//update a post
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        const id = req.params.id
        const userID = req.user.id
        const post = await Post.findById(id).populate("userId", "name profilePic")
        // check if post found
        if (!post) {
            return res.status(400).json({ message: "no post with this ID" })
        }
        // check if user who created the post is the same
        const x = post.userId._id

        if (x.toString() != userID) {
            return res.status(401).json({ message: "you can not update this post" })
        }

        const text = req.body.text
        post.caption = text

        await post.save()

        res.json({ message: "Post updated", post })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})


//delete a post
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        const postId = req.params.id
        const userId = req.user.id

        const post = await Post.findOneAndDelete({ userId, _id: postId },)
        console.log(post)
        if (!post) {
            return res.status(400).json({ message: "post does not exist" })
        }

        res.status(203).json({ message: "post deleted" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})


router.put("/:id/like", authMiddleware, async function (req, res) {
    try {
        const id = req.params.id
        const userID = req.user.id
        const post = await Post.findById(id)
        if (!post) {
            return res.status(400).json({ message: "no post with this ID" })
        }
        const exist = post.likes.includes(userID)
        if (exist) {
            post.likes = post.likes.filter((id) => id != userID)
        } else {
            post.likes.push(userID)
        }

        await post.save()

        res.json({ post, likes: post.likes.length })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})


//comments of a post
router.get("/:id/comment", async function (req, res) {
    try {
        const postId = req.params.id
        console.log(postId)
        const comments = await Comment.find({ postId }).populate("userId", "name profilePic").sort({ createdAt: -1 })


        res.status(201).json({ message: "comments loaded", comments })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router