const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { upload } = require("../utils/upload")
const { User } = require("../modle/user")
const router = express.Router()

router.put("/profile/update", authMiddleware, upload.single("profile"), async function (req, res) {
    try {
        //get user id
        const id = req.user.id


        // find user from database
        const user = await User.findById(id)


        // get photopath
        const path = req.file?.path
        if (path) {
            user.profilePic = path

        }

        //get bio
        const bio = req.body?.bio
        if (bio) {
            user.bio = bio
        }


        //save on database
        await user.save()

        res.json({ message: " profile updated", path: user.profilePic , bio:user.bio })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router
