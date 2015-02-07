angular.module('dagchat', [
'btford.socket-io'
]).
factory('chatSocket', function (socketFactory) {
  return socketFactory();
}).
controller('chatController', ['$scope', 'chatSocket',
function ($scope, chatSocket) {
  chatSocket.forward('log on event', $scope);
  chatSocket.forward('chat message', $scope);
  $scope.selectedMessages = {};
  $scope.$on('socket:log on event', function(ev, chat){
    ev.currentScope.chatMessages = chat.postNodes;
    ev.currentScope.responseEdges = chat.responseEdges;
  });
  $scope.$on('socket:chat message', function(ev, post){
    var postKey = Object.keys(post.postNode)[0]
    ev.currentScope.chatMessages[postKey] = post.postNode[postKey];
    ev.currentScope.responseEdges.push(post.responseEdges);
  });

  //TODO how to show branches?
  //pre render 1 line?
  //multiple controllers?
  //1 controller per "branch"...
  //but then we'd need some sort of service scope
  //.. to keep track of all selected

  $scope.selectMessage = function(message) {
    //TODO should probably have another structure
    //to make looking if any are selected easier.
    if(this.chatMessages[message["@rid"]].selected)
    {
      delete this.chatMessages[message["@rid"]].selected;
    }
    else {
      this.chatMessages[message["@rid"]].selected = "selected";
    }
  }

  //need access to chat socket in post message callback.
  //TODO look into a better way to decouple this
  $scope.chatSocket = chatSocket;
  $scope.postMessage = function(message) {
    var messageToPost = {
      text: this.currentMessage,
      respondsTo:
      Object.keys(this.chatMessages)
      [Object.keys(this.chatMessages).length - 1]

    };
    this.chatSocket.emit('chat message', messageToPost);
    this.currentMessage = '';
  }
}]);
