const { string } = require("joi")
const mongoose = require("mongoose")
const path = require('path');

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


        //profile info
        name:{type:String , required:true },
        bio:{type:String , default:""},
        profilePic: {type:String , default: path.join("public","default-profile-picture-male-icon.png")}

    }
)

const User = mongoose.model("users", userSchema)

module.exports = { User }