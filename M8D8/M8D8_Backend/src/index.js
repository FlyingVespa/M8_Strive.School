import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"

// Initializing the express server
const app = express()
app.use(cors())
app.use(express.json())

// Passing it to a Http Server
const server = createServer(app)

//Instantiating the io server using the http server. We can't pass the app here
const io = new Server(server, { allowEIO3: true })

let onlineUsers = []

// adding "event listeners" 
io.on("connection", socket => {
    console.log(socket.id)

    //Emits to this client.
    //socket.emit("newLogin")

    //Emit to everyone, including this client
    // io.sockets.emit("alive", "the server is alive")


    socket.on("login", ({ username, room }) => {
        onlineUsers.push({ username, id: socket.id, room })

        socket.join(room)
        console.log(socket.rooms)

        // Emits to everyone excluding this client
        socket.broadcast.emit("newLogin")
        socket.emit("loggedin")
    })

    socket.on("sendmessage", ({ message, room }) => {
        socket.to(room).emit("message", message)
    })

    socket.on("disconnect", () => {
        console.log("socket disconnected")
        onlineUsers = onlineUsers.filter(user => user.id !== socket.id)
    })

})

app.get('/online-users', (req, res) => {
    res.send({ onlineUsers })
})

//server.listen, app.listen will instantiate a new httpServer, unfortunately, without io
const port = process.env.PORT || 3030

server.listen(port, () => {
    console.log("Server listening on port " + port)
})