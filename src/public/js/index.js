const socket = io();
const listRooms = document.querySelector('.list-room');
const inputCreateRoom = document.querySelector('.input-create-room');
const btnCreateRoom = document.querySelector('.btn-create-room');
const inputUserName = document.querySelector('.form-input-login');
const btnLogin = document.querySelector('.btn-login');
const currentRoom = document.getElementById('currentRoom');
const formChatRoom = document.querySelector('.form-send-message');
const inputFormChatRoom = formChatRoom.querySelector('.form-send-input');
const listMessageChat = document.querySelector('.list-message');
const formLogin = document.getElementById('form-login');
const AppEle = document.getElementById('app');
const eleUsername = document.getElementById('username');

var messageData = []
var  username;
//join vao room
function emitJoinRoom(room){
    socket.emit('user-join-room', room)
    
}

//server gui ve room dang ton tai tren server
socket.on('server-send-rooms', function(data){
    const roomsHtml = data.roomsUserCreate.map(item=>{
        return `<li class="item-room">
                    <p>${item}</p>
                </li>`
    })
    listRooms.innerHTML = roomsHtml.join("");
    var itemRooms = document.querySelectorAll('.item-room');
    itemRooms = Array.from(itemRooms);
    itemRooms.forEach(element => {
        element.onclick = function(e){
            const nameRoom = e.target.innerText;
            emitJoinRoom(nameRoom);
        }
    });
})

// gui len server username login
btnLogin.onclick = function(){
    username = inputUserName.value.trim();
    socket.emit("user-login", username);
}
socket.on("login-success", function(data){
    if(data){
        formLogin.classList.add('disable');
        AppEle.classList.remove('disable');
        eleUsername.innerText = data.username;
    }
})

// create new room
btnCreateRoom.onclick = function(){
    const nameRoom = inputCreateRoom.value.trim();
    socket.emit("create-room", nameRoom);
    inputCreateRoom.value = "";
}

// server gui ve name new room for all
socket.on('server-send-new-room',function(data){
    const eleRoom = document.createElement('li');
    eleRoom.setAttribute('class','item-room');
    eleRoom.innerText = data.newRoom;
    listRooms.append(eleRoom);
    eleRoom.onclick = function(e){
        const nameRoom = e.target.innerText;
        emitJoinRoom(nameRoom);
    }
})
socket.on('server-send-room-name', function(data){
    currentRoom.innerText = data.roomName;
    formChatRoom.classList.remove('disable');
    const listMesageHtml = data.listMessage.map(item=>{
        return `<li class="item-message other">
                    <p class="user-name">${item.username}</p>
                    <div class="message-content-container">
                        <span class="message-content">${item.message}</span>
                    </div>
                </li>`
    });

    listMessageChat.innerHTML = listMesageHtml.join("");
    listMessageChat.scrollTop = listMessageChat.scrollHeight;
})

//user chat trong room
formChatRoom.onsubmit = function(e){
    e.preventDefault();
    const message = inputFormChatRoom.value.trim();
    socket.emit('user-chat-room', message);
    inputFormChatRoom.value = "";
}
socket.on('server-send-chat-room', function(data){

    const message  = data.message;
    const nameSocket = data.username;
    const eleMessageChat = document.createElement('li');
    const name = document.createElement('p');
    const contentMessage = document.createElement('span');
    const contentContainer = document.createElement('div');

    if(nameSocket === username){
        eleMessageChat.classList.add('item-message','me');
    }else{
        eleMessageChat.classList.add('item-message','other');
    }

    name.classList.add('user-name');
    contentMessage.classList.add('message-content');
    contentContainer.classList.add('message-content-container');
    contentMessage.innerText = message;
    name.innerText = nameSocket;
    contentContainer.appendChild(contentMessage);
    eleMessageChat.append(name,contentContainer);
    listMessageChat.append(eleMessageChat);
    listMessageChat.scrollTop = listMessageChat.scrollHeight;
})

socket.on("server-send-Notify", function(data){
    alert(data.message);
});