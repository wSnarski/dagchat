angular.module('dagchat', [
'btford.socket-io'
]).
factory('chatSocket', function (socketFactory) {
  return socketFactory();
}).
controller('chatController', ['$scope', 'chatSocket',
function chatController ($scope, chatSocket) {
  chatSocket.forward('log on event', $scope);
  chatSocket.forward('chat message', $scope);
  $scope.selectedMessages = {};
  $scope.chatMessages = {};
  $scope.$on('socket:log on event', function(ev, chat){
    ev.currentScope.chatMessages = chat.postNodes;
    ev.currentScope.responseEdges = chat.responseEdges;
  });
  $scope.$on('socket:chat message', function(ev, post){
    var postKey = Object.keys(post.postNode)[0]
    ev.currentScope.chatMessages[postKey] = post.postNode[postKey];
    post.responseEdges.forEach(function(respondsTo) {
      ev.currentScope.responseEdges.push(post.respondsTo);
    });
  });

  //TODO how to show branches?
  //pre render 1 line?
  //multiple controllers?
  //1 controller per "branch"...
  //but then we'd need some sort of service scope
  //.. to keep track of all selected

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
