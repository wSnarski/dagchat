angular.module('dagchat', [
'btford.socket-io',
'cfp.hotkeys'
]).
factory('chatSocket', function (socketFactory) {
  return socketFactory();
}).
factory('dagPathBuilder', function() {
  var pathBuilder = {};
  var uniquePaths = {};
  //TODO expand this to allow for instantiating,
  //                              adding new ordered edges ..etc.
  return function(orderedEdges) {
    //set up for iterating
    pathBuilder[orderedEdges[0].in] = [[orderedEdges[0].in]];
    pathBuilder[orderedEdges[0].in][0].final = true;
    //iterate
    for(var i = 0; i < orderedEdges.length; i++) {
      var fromId = orderedEdges[i].in;
      var toId = orderedEdges[i].out;
      //assuming this always exists.
      //copy the array at the in,
      //set every final of the array at in to false
      //copy the array to the out array (make or add)
      if(!(toId in pathBuilder)) {
        pathBuilder[toId] = [];
      }
      var toPathOffset = pathBuilder[toId].length;
      for(var j = 0;
              j < pathBuilder[fromId].length;
              j++) {
                pathBuilder[toId].push(pathBuilder[fromId][j].slice(0));
                pathBuilder[fromId][j].final = false;
                pathBuilder[toId][toPathOffset + j].push(toId);
                pathBuilder[toId][toPathOffset + j].final = true;
      }
    }
    //TODO optimize this?
    //do this during the above loop?
    //do this final thing differently in general?
    var pathKeys = Object.keys(pathBuilder);
    for(var i = 0; i < pathKeys.length; i++) {
      for(var j = 0; j < pathBuilder[pathKeys[i]].length; j++) {
        if(pathBuilder[pathKeys[i]][j].final === true) {
          if(!(pathKeys[i] in uniquePaths)) {
            uniquePaths[pathKeys[i]] = [];
          }
          uniquePaths[pathKeys[i]].push(pathBuilder[pathKeys[i]][j]);
        }
      }
    }
    return uniquePaths;
  };
}).
controller('chatController', ['$scope', 'chatSocket', 'dagPathBuilder',
function chatController ($scope, chatSocket, dagPathBuilder) {
  chatSocket.forward('log on event', $scope);
  chatSocket.forward('chat message', $scope);
  $scope.selectedMessages = {};
  $scope.chatMessages = {};
  $scope.uniquePaths = {};
  $scope.selectedPath = [];
  //TODO this is not gonna work, need to find a better
  //     way to keep track and cycle between paths.
  $scope.selectedPathNumber = 0;
  //TODO this probably shouldnt be an object
  $scope.selectedMessages = [];

  $scope.$on('socket:log on event', function(ev, chat){
    ev.currentScope.chatMessages = chat.postNodes;
    ev.currentScope.responseEdges = chat.responseEdges;
    //TODO make this cleaner
    $scope.uniquePaths = dagPathBuilder(chat.responseEdges);
    $scope.selectedPath =
      $scope.uniquePaths[Object.keys($scope.uniquePaths)
      [$scope.selectedPathNumber]][0]; //TODO this is not gonna work
    for(var i = 0; i < $scope.selectedPath.length; i++) {
      $scope.selectedMessages.push(
        $scope.chatMessages[$scope.selectedPath[i]]);
    }
  });
  $scope.$on('socket:chat message', function(ev, post){
    var postKey = Object.keys(post.postNode)[0]
    ev.currentScope.chatMessages[postKey] = post.postNode[postKey];
    post.responseEdges.forEach(function(respondsTo) {
      ev.currentScope.responseEdges.push(post.respondsTo);
    });
  });

  $scope.selectMessage = function(message) {
    if(this.chatMessages[message["@rid"]].selected)
    {
      delete this.chatMessages[message["@rid"]].selected;
      delete this.selectedMessages[message["@rid"]];
    }
    else {
      this.chatMessages[message["@rid"]].selected = "selected";
      this.selectedMessages[message["@rid"]] = true;
    }
  };

  $scope.clearSelected = function() {
    var loc_scope = this;
    Object.keys(this.selectedMessages).forEach(function(selectedMessage) {
      delete loc_scope.chatMessages[selectedMessage].selected;
    });
    this.selectedMessages = {};
  }
  //TODO replace some of this stuff with underscore functions

  //need access to chat socket in post message callback.
  //TODO look into a better way to decouple this
  $scope.chatSocket = chatSocket;
  $scope.postMessage = function(message) {
    var respondsTo = [];
    if(Object.keys(this.selectedMessages).length === 0) {
      respondsTo.push(Object.keys(this.chatMessages)
                     [Object.keys(this.chatMessages).length - 1])
    } else {
      Object.keys(this.selectedMessages).forEach(function(selectedMessage) {
        respondsTo.push(selectedMessage);
      });
    }

    var messageToPost = {
      text: this.currentMessage,
      respondsTo: respondsTo


    };
    this.chatSocket.emit('chat message', messageToPost);
    this.currentMessage = '';
    this.clearSelected();
  }
}]);
