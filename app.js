var express = require('express');

var app = express();
var http = require('http').Server(app);
var md5 = require('MD5');
var io = require('socket.io')(http);
var Oriento = require("oriento");

var server = Oriento({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'pw'
});

var db = server.use({
  name: 'dagchat',
  username: 'admin',
  password: 'admin'
});

app.locals.db = db;

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

app.use('/public', express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

io.on('connection', function(socket){
    console.log('a user connected');
  //hard coded root of the current chat.
  app.locals.db.traverse().from('#12:0').all()
  .then(function(posts){
    var chat = {
      postNodes: {},
      responseEdges: []
    }
    posts.forEach(function(post){
      if(post["@class"] === "Post") {
        chat.postNodes[post["@rid"]] = {
          "@rid": post["@rid"],
          text: post.text
          };
      } else if (post["@class"] === "RespondsTo") {
        var responseEdge = {
          "@rid": post["@rid"],
          in: post.in["@rid"],
          out: post.out["@rid"],
        };
        chat.responseEdges.push(responseEdge);
      }
    });
    //order because i need it on the front end.
    chat.responseEdges.sort(function(a,b){
      //TODO find out if this can be done cleaner
      var idA = a["@rid"].position;
      var idB = b["@rid"].position;
      if(idA < idB)
        return -1;
      else if(idA > idB)
        return 1;
      else return 0;
    });
    socket.emit('log on event', chat);
  });
  socket.on('login', function(user){
    console.log(md5(user.trim().toLowerCase()));
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  //TODO look into doing this as one statement.
  socket.on('chat message', function(message) {
    var persistedMessage = {
      postNode: {},
      responseEdges: []
    };
    db.insert().into('Post').set({text: message.text}).one()
    .then(function(post){
      persistedMessage.postNode[post["@rid"]] = {
        "@rid": post["@rid"],
        text: post.text
      };
      //loop over each edge we want to make.
      var edgesAdded = 0;
      message.respondsTo.forEach(function(node) {
        db.create('edge', 'RespondsTo')
        .from(post["@rid"])
        .to(node)
        .one()
        .then(function(edge) {
          persistedMessage.responseEdges.push(
          {
            "@rid": edge["@rid"],
            in: node,
            out: post["@rid"]
          });
          //TODO, more reason to do this in one statement.
          edgesAdded++;
          if(edgesAdded === message.respondsTo.length) {
            io.emit('chat message', persistedMessage);
          }
        });
      });
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

module.exports = app;
