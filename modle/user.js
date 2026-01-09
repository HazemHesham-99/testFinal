const mongoose =require("mongoose")

const userSchema = mongoose.Schema(
    {
        email:{type: String ,required:true , unique:true},
        password:{type: String ,required:true},
        role: {type : String , enum:["user", "admin" , "super_admin"] },

        otp : {type:string ,maxLength:6},
        otpExpires : {type:Date},
        isVerify : {type:Boolean , default:false}
    }
)

const user = mongoose.model("users",userSchema)

module.export= {user}