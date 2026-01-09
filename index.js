//imports
const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const rateLimit = require("express-rate-limit")

const { connectDataBase } = require("./config/dbConfig")
const authRoutes = require("./routes/authRoute")

//app
const app = express()
const PORT = process.env.PORT || 3000

// GLOBAL MIDDLEWARE

app.use(express.json())
app.use(cors({
    origin: JSON.parse(process.env.PRODUCTION) ? process.env.CLIENT_ORIGIN : "*"
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
})

app.use(limiter)

//Routes
app.get("/", (req, res) => {
    res.send("welcome to our website")
})

app.use("/api/v1/auth", authRoutes)


// connect to database
connectDataBase()

// run server
app.listen(PORT, () => {
    console.log(`server running at port :${PORT}`)
})


