import express from "express"
import { createServer } from "http"
import {Server} from "socket.io"

const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on("connection",(socket)=>{
    console.log("a user connected",socket.id);

    socket.on("joinMapRequest",(data,cb)=>{
        io.emit("connectUser",{id: socket.id, longitude: data.longitude, latitude: data.latitude});        
        cb("Successfully joined map");
    })    

    socket.on('disconnect',()=>{
        io.emit("removeUser",{id: socket.id});
        console.log("User disconnected!");        
    })
})


server.listen(3000,()=>{
    console.log("Server Listening on port 3000");
})

