const dotenv = require("dotenv").config()
const jwt = require("jsonwebtoken")


function authMiddleware(req, res, next) {
    try {
        const auth = req.headers["authorization"]
        if (!auth) {
            res.status(401).json({ message: "unauthorized1" })
        }

        const token = auth.split(" ")[1]
        if (!auth) {
            res.status(401).json({ message: "unauthorized2" })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.user = payload
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "unauthorized3" })

    }
}

module.exports={authMiddleware}