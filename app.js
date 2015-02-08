var express = require('express');

var app = express();
var http = require('http').Server(app);
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

    socket.emit('log on event', chat);
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
        });
      });
      io.emit('chat message', persistedMessage);
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

module.exports = app;
