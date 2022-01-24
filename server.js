const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const http = require('http');
var cors = require('cors')
app.use(cors())
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["*"]
    }
});

let activeUsers = new Set();
let listMessages = [];
let listUserWithId = {};
let listVideoCall = [];

io.on('connection', (socket) => {
    socket.on('join', (room) => {
        socket.join(room);
        if (room == "messageChannel") {
            io.to(["messageChannel"]).emit("list message", [...listMessages]);
        }
    });

    socket.on('new user', (username) => {
        socket.userId = username;
        listUserWithId[username] = socket.id;
        activeUsers.add(username)
        io.to(["messageChannel"]).emit("send list user", [...activeUsers]);

    });

    socket.on('typing', (userName) => {
        io.to(["messageChannel"]).emit("typing", userName);
    });

    socket.on('new message', (data) => {
        listMessages.push(data)
        io.to(["messageChannel"]).emit("new message comming", [...listMessages]);
    });

    // video call
    socket.on('request a call', (data) => {
        io.to(listUserWithId[data.toUserName]).emit("receive a request call", {
            ...data,
            toId: listUserWithId[data.toUserName],
        });
    });

    socket.on('send signal to callee', (data) => {
        console.log('data: ', data);
        io.to(data.to).emit("receive a signal call", data.signal);
    });

    socket.on('accept a call', (data) => {
        const idCall = uuidv4();
        io.to(listUserWithId[data.toUserName]).emit("accept a call", {
            ...data,
            idCall,
        });
        io.to(listUserWithId[data.fromUserName]).emit("accept a call", {
            ...data,
            idCall,
        });
    });

    socket.on('disconnect', (userName) => {
        activeUsers.delete(socket.userId);
        io.to(["messageChannel"]).emit("user disconnected", socket.userId);
    });

});

server.listen(4000, () => {
    console.log('listening on *:4000');
});