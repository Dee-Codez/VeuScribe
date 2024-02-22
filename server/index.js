// const server = require("http").createServer(app);
// const cors = require('cors');
// const { createServer } = require("https");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;

const io = new Server(8000,{
    cors: true,
} );

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
    })

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
    })

    socket.on("peer:nego:done",({to,ans})=>{
        // console.log("peer:nego:done",ans);
        io.to(to).emit("peer:nego:final",{from:socket.id, ans})
    });
})

// httpServer.listen(PORT, () => console.log("Server listening on port " + PORT));

// server.listen(PORT, () => console.log("Server listening on port " + PORT));