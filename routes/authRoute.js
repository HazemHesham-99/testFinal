const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const otpGenerator = require('otp-generator')
const dotenv = require("dotenv").config()

const { loginSchema, verifySchema, signinSchema, resendOTPSchema } = require("../validation/uservalidation")
const { User } = require("../modle/user")
const { sendEmail } = require("../utils/sendEmail")
const router = express.Router()

router.post("/login", async function (req, res) {
    try {
        const { value, error } = signinSchema.validate(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json({ message: error.details.map(e => e.message) })
        }

        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: "invalid crad2" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            res.status(400).json({ message: "invalid crad1" })
        }

        if (!user.isVerify) {
            res.status(400).json({ message: "u are not varifaied", verify: false, email: user.email })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_expiresIn })
        res.status(200).json({ message: "login successfully", token: token })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }

})

router.post("/register", async function (req, res) {
    try {
        const { value, error } = loginSchema.validate(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json({ message: error.details.map(e => e.message) })
        }

        const { email, password } = req.body
        const existUser = await User.findOne({ email })

        if (existUser) {
            res.status(409).json({ message: "user already exist" })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const otp = otpGenerator.generate(6, { digits: true })

        const otpExpires = Date.now() + 1000 * 60 * 15

        const user = await User.create({ email, password: hashedPassword, otp, otpExpires })

        await sendEmail(email, "OTP confirmition", `ur OTP is ${otp}`)

        res.status(201).json({ message: "OTP sent to ur inbox" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }

})

router.post("/verify-otp", async function (req, res) {
    try {
        const { value, error } = verifySchema.validate(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json({ message: error.details.map(e => e.message) })
        }
        const { email, otp } = req.body

        const existUser = await User.findOne({ email })

        if (!existUser) {
            res.status(400).json({ message: "WRONG EMAIL" })
        }

        if (otp != existUser.otp || Date.now < existUser.otpExpires) {
            res.status(403).json({ message: "wrong OTP OR expired" })
        }

        //verify
        existUser.isVerify = true
        existUser.otp = undefined
        existUser.otpExpires = undefined
        await existUser.save()

        res.status(201).json({ message: "verified" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }

})

router.post("/resend-otp", async function (req, res) {
    try {
        const { value, error } = resendOTPSchema.validate(req.body, { abortEarly: false })

        if (error) {
            res.status(400).json({ message: error.details.map(e => e.message) })
        }
        const { email } = req.body

        const existUser = await User.findOne({ email })

        if (!existUser) {
            res.status(400).json({ message: "WRONG EMAIL" })
        }

        if (existUser.isVerify) {
            res.status(400).json({ message: "already verified" })
        }

        const otp = otpGenerator.generate(6, { digits: true })

        const otpExpires = Date.now() + 1000 * 60 * 15

        existUser.otp = otp
        existUser.otpExpires = otpExpires

        await existUser.save()

        await sendEmail(email, "OTP confirmition", `ur OTP is ${otp}`)

        res.status(201).json({ message: "OTP sent to ur inbox" })



    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server error" })
    }
})

module.exports = router

