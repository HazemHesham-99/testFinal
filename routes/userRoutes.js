const express = require("express")
const { authMiddleware } = require("../middleware/authMiddleware")
const { upload } = require("../utils/upload")
const { User } = require("../modle/user")
const router = express.Router()

router.put("/profile/update", authMiddleware, upload.single("profile"),async function (req, res) {
    try { 
        //get user id
        const id=req.user.id

        console.log(id)

        // find user from database
        const user = await User.findById(id)

        console.log(user)

        // get photopath
        const path =req.file.path

        console.log(path)

        //save on database
        user.profilePic= path
        await user.save()

        res.json({message: " photo updated", path})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router
