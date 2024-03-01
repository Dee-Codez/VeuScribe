// const server = require("http").createServer(app);
// const cors = require('cors');
// const { createServer } = require("https");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
  
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});


const { Server } = require("socket.io");
const io = new Server(server,{cors: true});

const nameToSocketidMap = new Map();
const socketIdToNameMap = new Map();

io.on('connection', (socket) => {
    console.log(`Connection established`,socket.id);
    socket.on("room:join", (data) => {
        const {name, room} =data;
        nameToSocketidMap.set(name, socket.id);
        socketIdToNameMap.set(socket.id, name);
        io.to(room).emit('user:joined',{name,id:socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
    });

    socket.on("user:call", ({ to, offer }) => {
        const hostname = socketIdToNameMap.get(socket.id);
        io.to(to).emit("incoming:call", { from: socket.id,hostname, offer });
    });

    socket.on("call:accepted",({to,ans})=>{
        const frmname = socketIdToNameMap.get(socket.id)
        io.to(to).emit("call:accepted", { from: frmname, ans });
    });

    socket.on("peer:nego:needed",({to,offer})=>{
        // console.log("peer:nego:needed",offer);
        io.to(to).emit("peer:nego:needed",{from:socket.id, offer});
    });

    socket.on("peer:nego:done",({to,ans})=>{
        // console.log("peer:nego:done",ans);
        io.to(to).emit("peer:nego:final",{from:socket.id, ans})
    });

    socket.on("send:icecandidate",({data,to})=>{
        socket.to(to).emit("receive:icecandidate",data.candidate);
    })

    socket.on("remote:transcript",({to,script})=>{
        console.log(`Script RCVD: ${script}`);
        socket.to(to).emit("set:remote:transcript",{transcript:script})
    });

    

    socket.on("query:call",({to,query})=>{
        const scribeQuery = query;
    })
})

// httpServer.listen(PORT, () => console.log("Server listening on port " + PORT));

// server.listen(PORT, () => console.log("Server listening on port " + PORT));