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
        console.log(data);
    //     const {name, room} =data;
    //     nameToSocketidMap.set(name, socket.id);
    //     socketIdToNameMap.set(socket.id, name);
    //     socket.to("room:join",data);
    })


})

// httpServer.listen(PORT, () => console.log("Server listening on port " + PORT));

// server.listen(PORT, () => console.log("Server listening on port " + PORT));