var socket;
(function connect(){
    socket = io.connect('http://localhost:3000')
})()

function sendDraw(position, pickedColor){
  socket.emit('send_draw', {color: pickedColor, position: position})
}

function sendClean(){
  socket.emit('send_clean', null)
}

function sendSave(name){
  socket.emit('send_save', {imagename: name})
}

function sendOpen(name){
  socket.emit('send_open', {imagename: name})
}

socket.on('receive_draw', data => {
    colorRect(data.position, data.color)
})

socket.on('receive_clean', data => {
  wipeBoard()
})
socket.on('success_save', data =>{
  showSuccess()
})
