const joi =require("joi")

const loginSchema =joi.object({
    email:joi.string().required().email(),
    password: joi.string().min(4).required()

})

const signinSchema =joi.object({
    email:joi.string().required().email(),
    password: joi.string().min(4).required()

})

const verifySchema = joi.object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
});

const resendOTPSchema = joi.object({
    email: joi.string().email().required(),
});

module.exports={loginSchema,verifySchema,signinSchema,resendOTPSchema}