const { string } = require("joi")
const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
images:[String],
caption : {type: String ,default:""},
userId: {type :mongoose.Types.ObjectId , ref:"users",required:true},
likes:[{type :mongoose.Types.ObjectId , ref:"users"}]
},
{timestamps:true}
)

 const Post = mongoose.model("Posts", postSchema)

module.exports = {Post}