const express = require("express")
const dotenv = require("dotenv").config()

const app = express()

const PORT = process.env.PORT || 3000
app.get("/", (req, res) => {
    res.send("welcome to our website")
})
app.listen(PORT, () => { console.log(`server running at port :${PORT}`) })