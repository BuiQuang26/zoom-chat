const express = require("express");
const { disconnect } = require("process");
const path = require("path");
const { waitForDebugger } = require("inspector");
const app = express()
const port =  process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')))

// socket 
const server = require('http').createServer(app);
const io = require('socket.io')(server);


//fake data base : list user login
let listUser = [];
const roomsUserCreate = [];
const messageDataBase = {};


// router
app.get("/", function(req,res){
    res.sendFile(__dirname + "/views/index.html");
})


io.on('connection', (socket) => { 


    //reset data base
    setInterval(function(){
        socket.emit("server-send-Notify",{
            message:  "PREPARE-DATA-RESET",
        })
    },50*60000);
    setInterval(function(){
        roomsUserCreate.splice(0, roomsUserCreate.length);
        keyname = Object.keys(messageDataBase);
        keyname.forEach(element => {
            delete messageDataBase[element];
        });
        socket.emit("server-reset-database",{
            reset_data: "true",
        })
        console.log("reset data");
        socket.emit("server-send-rooms", {
            listUser,
            roomsUserCreate
        })
        socket.emit("server-send-room-name", {
            roomName : "room reset",
            listMessage: []
        });
   },60*60000); //1h reset la data base một lần


    console.log("clien connect....")

    socket.emit("server-send-rooms", {
        listUser,
        roomsUserCreate
    })

    //user get rooms on server
    socket.on("user-get-rooms", function(data){
        socket.emit("server-send-rooms", {
            listUser,
            roomsUserCreate
        })
    });

    // user tao room 
    socket.on('create-room', function(data){
        if(roomsUserCreate.indexOf(data) > -1){
            socket.emit("server-send-Notify",{
                message:  "NAME-ROOM-USED",
            });
            return;
        }
        socket.join(data);
        socket.currentRoom = data;
        roomsUserCreate.push(data);
        messageDataBase[data] = [];
        socket.emit("server-send-room-name", {
            roomName : data,
            listMessage: messageDataBase[data]
        });
        io.sockets.emit("server-send-new-room", {
            newRoom: data,
        });
    })

    //user join room
    socket.on('user-join-room', function(room){
        socket.leave(socket.currentRoom);
        socket.join(room);
        socket.currentRoom = room;
        if(messageDataBase[room] == undefined) return;
        socket.emit("server-send-room-name", {
            roomName : room,
            listMessage: messageDataBase[room]
        });
    })

    // user login
    socket.on("user-login", function(data){

        if(listUser.indexOf(data) > -1){
            socket.emit("server-send-Notify",{
                message:  "username used",
            });
            return;
        }
        socket.username = data;
        listUser.push(data)
        socket.emit("login-success", {
            username: data
        })
        
    })

    //user chat room
    socket.on('user-chat-room', function(data){
        const room = socket.currentRoom;
        
        if(room == null || messageDataBase[room] == undefined) return;
        messageDataBase[room].push({
            username: socket.username,
            message: data
        });
        
        io.to(socket.currentRoom).emit('server-send-chat-room',{
            username: socket.username,
            message: data
        })
    })

    //user login out
    socket.on("user-log-out", function(){
        console.log("log out : " + socket.username);
        listUser = listUser.filter(item=>{
            return item !== socket.username;
        })
    });

    // user disconnect
    socket.on('disconnect', function(){
        console.log("log out : " + socket.username);
        listUser = listUser.filter(item=>{
            return item !== socket.username;
        })
        console.log(listUser)
    })
});

server.listen(port, function(){
    console.log(`server listning port ${port}`);
})