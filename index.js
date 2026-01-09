//imports
const express = require("express")
const { connectDataBase } = require("./config/dbConfig")
const dotenv = require("dotenv").config()

//app
const app = express()

const PORT = process.env.PORT || 3000

//Routes
app.get("/", (req, res) => {
    res.send("welcome to our website")
})


// connect to database
connectDataBase()

// run server
app.listen(PORT, () => {
    console.log(`server running at port :${PORT}`)
})