const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin", "super_admin"], default: "user" },

        otp: { type: String, maxLength: 6 },
        otpExpires: { type: Date },
        isVerify: { type: Boolean, default: false },

        forgetPasswordOTP: { type: String },
        forgetPasswordotpExpires: { type: Date },

    }
)

const User = mongoose.model("users", userSchema)

module.exports = { User }