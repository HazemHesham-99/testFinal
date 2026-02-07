const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { upload } = require("../utils/upload")
const { User } = require("../modle/user")
const { updateProfileSchema } = require("../validation/uservalidation")
const { Post } = require("../modle/Posts")
const router = express.Router()

//update profile
router.put("/profile/update", authMiddleware, upload.single("profile"), async function (req, res) {
    try {

        const { value, error } = updateProfileSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).json({ message: error.details.map(e => e.message) })
        }

        //get user id
        const id = req.user.id

        // find user from database
        const user = await User.findById(id)

        const { bio, name } = value
        // get photopath
        const path = req.file?.path
        if (path) {
            user.profilePic = path

        }

        //get bio
        if (bio) {
            user.bio = bio
        }

        if (name) {
            user.name = name
        }


        //save on database
        await user.save()

        res.json({ message: " profile updated", path: user.profilePic, bio: user.bio, name: user.name })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

// get a user posts
router.get("/:userId/posts", async function (req, res) {
    try {
        const userId = req.params.userId

        const page = parseInt(req.query.page) || 1;      // Default: page 1
        const limit = parseInt(req.query.limit) || 10;   // Default: 10 posts per page

        // Calculate skip value for skip
        const skip = (page - 1) * limit;


        const posts = await Post.find({ userId }).populate("userId", "name profilePic").sort
            ({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit)


        const totalPosts = await Post.countDocuments({ userId });
        const totalPages = Math.ceil(totalPosts / limit);


        res.json({ message: "post fetched", posts , page:{totalPages,page,limit} })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router
