//imports
const mongoose =require("mongoose")
const dotenv = require("dotenv").config()

//connection function
async function connectDataBase(){
    try{
        await mongoose.connect(process.env.CONNECTIONstring)
        console.log("database connected")
    }catch(err){
        console.error();
    }
}

// export
module.exports={connectDataBase}