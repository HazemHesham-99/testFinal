const joi = require("joi")

const createPostSchema = joi.object({
    images: joi.array().items(joi.string()).unique(),
    caption: joi.string().default(""),
}

)
