const express = require('express')
const socketio = require('socket.io')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res)=> {
    res.render('index')
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server is running")
})

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "testUser",
  password: "testPassword",
  database: 'socialmedia'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


var imageArr = new Array(0);

function colorRect(data){
  imageArr.push(data)
}

function saveImage(imagename){
  var sql1 = "DELETE FROM t_imagepoint WHERE imagename = '" + imagename + "'";
  con.query(sql1,function (err, result) {
    if (err) console.log("error in delete")
});
  for(var i = 0; i< imageArr.length; i++){
    var sql2 = "INSERT INTO t_imagepoint (imagename, color, x, y) VALUES ('"+ imagename +"', '"+ imageArr[i].color +"', "+ imageArr[i].position.x + ", " + imageArr[i].position.y +" )";
    con.query(sql2, function (err, result) {
    if (err) return false;
  });
  }
  return true;
}

function loadImage(imagename){
  imageArr = new Array(0);
  var sql = "SELECT * FROM t_imagepoint WHERE imagename = '" + imagename + "'";
  con.query(sql,function (err, result) {
    if (err) console.log("error in delete")
    for(var i = 0; i< result.length; i++){
      var pos = {x: result[i].x, y: result[i].y}
      var data = {color: result[i].color, position: pos}
      imageArr.push(data)
    }
    for(var i = 0; i< imageArr.length; i++){
      io.sockets.emit('receive_draw', {color: imageArr[i].color, position: imageArr[i].position})
    }
});

}

//initialize socket for the server
const io = socketio(server)

io.on('connection', socket => {
    for(var i = 0; i< imageArr.length; i++){
      socket.emit('receive_draw', {color: imageArr[i].color, position: imageArr[i].position})
    }

    socket.on('send_draw', data => {
      colorRect(data);
      io.sockets.emit('receive_draw', {color: data.color, position: data.position})
    })

    socket.on('send_clean', data =>{
      imageArr = new Array(0);
      io.sockets.emit('receive_clean', null)
    })

    socket.on('send_save', data =>{
      success = saveImage(data.imagename)
      if(success){
        socket.emit('success_save', null)
      }
    })

    socket.on('send_open', data =>{
      loadImage(data.imagename)
    })

})
