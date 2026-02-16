//imports
const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const path = require('path');

//socket.io server
const http = require("http")
const { Server } = require("socket.io")
const initSocket = require("./socket")

const { connectDataBase } = require("./config/dbConfig")
const authRoutes = require("./routes/authRoute")
const userRoutes = require("./routes/userRoutes")
const postsRoutes = require("./routes/postsRoute")
const commentRoutes = require("./routes/commentRoute")
const { upload } = require("./utils/upload");

//app
const app = express()
const PORT = process.env.PORT || 3000

// GLOBAL MIDDLEWARE
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/public", express.static(path.join(__dirname, "public")))

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
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/posts", postsRoutes)
app.use("/api/v1/comment", commentRoutes)





// ⭐⭐⭐ SOCKET.IO SETUP STARTS HERE ⭐⭐⭐


// ===== SERVER =====
const server = http.createServer(app); // Create HTTP server
// ===== SOCKET =====
initSocket(server)



connectDataBase()

// run server
server.listen(PORT, () => {
    console.log(`server running at port :${PORT}`)
})


