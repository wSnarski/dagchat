dagchat.controller('chatController',
['$scope', 'chatSocket', 'dagPathBuilder', 'hotkeys',
function chatController ($scope, chatSocket, dagPathBuilder, hotkeys) {
  hotkeys.add({
    combo:'shift+right',
    description: 'Go to the next story',
    callback: function() {
      $scope.goToNextStory();
    }
  });
  hotkeys.add({
    combo:'shift+left',
    description: 'Go to the previous story',
    callback: function() {
      $scope.goToPreviousStory();
    }
  });
  chatSocket.forward('log on event', $scope);
  chatSocket.forward('chat message', $scope);
  $scope.flaggedMessages = {};
  $scope.chatMessages = {};
  $scope.uniquePaths = {};
  $scope.selectedPath = [];
  //a combination of two [0][0] will get us the selected unique path
  $scope.selectedCompositePathKey = 0;
  $scope.selectedUniquePathKey = 0;
  $scope.selectedMessages = [];

  $scope.$on('socket:log on event', function(ev, chat){
    ev.currentScope.chatMessages = chat.postNodes;
    ev.currentScope.responseEdges = chat.responseEdges;
    //TODO make this cleaner
    $scope.uniquePaths = dagPathBuilder(chat.responseEdges);
    $scope.showSelectedStory();

  });
  $scope.$on('socket:chat message', function(ev, post){
    //TODO this has to rebuild our unique paths..etc.
    var postKey = Object.keys(post.postNode)[0]
    ev.currentScope.chatMessages[postKey] = post.postNode[postKey];
    post.responseEdges.forEach(function(respondsTo) {
      ev.currentScope.responseEdges.push(respondsTo);
    });
    //TODO this is crude, figure out the minimum that has to be done.
    $scope.uniquePaths = dagPathBuilder(ev.currentScope.responseEdges);
    $scope.showSelectedStory();
  });

  $scope.selectMessage = function(message) {
    if(this.chatMessages[message["@rid"]].selected)
    {
      delete this.chatMessages[message["@rid"]].selected;
      delete this.flaggedMessages[message["@rid"]];
    }
    else {
      this.chatMessages[message["@rid"]].selected = "selected";
      this.flaggedMessages[message["@rid"]] = true;
    }
  };

  $scope.clearSelected = function() {
    var loc_scope = this;
    Object.keys(this.flaggedMessages).forEach(function(flaggedMessage) {
      delete loc_scope.chatMessages[flaggedMessage].selected;
    });
    this.flaggedMessages = {};
  }
  //TODO replace some of this stuff with underscore functions

  //need access to chat socket in post message callback.
  //TODO look into a better way to decouple this
  $scope.chatSocket = chatSocket;
  $scope.postMessage = function(message) {
    var respondsTo = [];
    if(Object.keys(this.flaggedMessages).length === 0) {
      //TODO make responds to the last in the current path
      respondsTo.push($scope.selectedPath[$scope.selectedPath.length - 1]);
    } else {
      Object.keys(this.flaggedMessages).forEach(function(flaggedMessage) {
        respondsTo.push(flaggedMessage);
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

  $scope.changeCompositePath = function(compositePathIndex) {
    var previousComposite = $scope.selectedCompositePathKey;
    var previousUnique = $scope.selectedUniquePathKey;

    $scope.selectedCompositePathKey = compositePathIndex;
    $scope.selectedUniquePathKey = 0;
    $scope.showSelectedStory({
      previousComposite: previousComposite,
      previousUnique: previousUnique
    });
  };
  $scope.changeUniquePath = function(uniquePathIndex) {
    var previousComposite = $scope.selectedCompositePathKey;
    var previousUnique = $scope.selectedUniquePathKey;

    $scope.selectedUniquePathKey = uniquePathIndex;
    $scope.showSelectedStory({
      previousComposite: previousComposite,
      previousUnique: previousUnique
    });
  };
  $scope.showSelectedStory = function(previousStory) {
    //TODO select and deseselect paths so that we can see them
    if(previousStory !== undefined) {
      delete $scope.uniquePaths[Object.keys($scope.uniquePaths)
      [previousStory.previousComposite]].active;

      delete $scope.uniquePaths[Object.keys($scope.uniquePaths)
      [previousStory.previousComposite]]
      [previousStory.previousUnique].active;
    }
    $scope.selectedPath =
    $scope.uniquePaths[Object.keys($scope.uniquePaths)
    [$scope.selectedCompositePathKey]]
    [$scope.selectedUniquePathKey];

    $scope.uniquePaths[Object.keys($scope.uniquePaths)
    [$scope.selectedCompositePathKey]].active = "active";

    $scope.uniquePaths[Object.keys($scope.uniquePaths)
    [$scope.selectedCompositePathKey]]
    [$scope.selectedUniquePathKey].active = "active";

    $scope.selectedMessages = [];
    for(var i = 0; i < $scope.selectedPath.length; i++) {
      $scope.selectedMessages.push(
        $scope.chatMessages[$scope.selectedPath[i]]);
      }
    };

    $scope.goToPreviousStory = function() {
      var previousComposite = $scope.selectedCompositePathKey;
      var previousUnique = $scope.selectedUniquePathKey;
      var keys = Object.keys($scope.uniquePaths);
      if($scope.selectedUniquePathKey > 0) {
        $scope.selectedUniquePathKey --;
      }
      else if ($scope.selectedCompositePathKey > 0){
        $scope.selectedCompositePathKey --;
        $scope.selectedUniquePathKey =
        $scope.uniquePaths[keys[$scope.selectedCompositePathKey]].length - 1;
      }
      else {
        $scope.selectedCompositePathKey = keys.length - 1;
        $scope.selectedUniquePathKey =
        $scope.uniquePaths[keys[keys.length-1]].length - 1;
      }

      $scope.showSelectedStory({
        previousComposite: previousComposite,
        previousUnique: previousUnique
      });
    };

    $scope.goToNextStory = function() {
      var previousComposite = $scope.selectedCompositePathKey;
      var previousUnique = $scope.selectedUniquePathKey;
      if($scope.selectedUniquePathKey <
        $scope.uniquePaths[Object.keys($scope.uniquePaths)
        [$scope.selectedCompositePathKey]].length - 1) {
          $scope.selectedUniquePathKey ++;
        }
        else if ($scope.selectedCompositePathKey <
          Object.keys($scope.uniquePaths).length -1 )
        {
          $scope.selectedCompositePathKey ++;
          $scope.selectedUniquePathKey = 0;
        }
        else {
          $scope.selectedUniquePathKey = 0;
          $scope.selectedCompositePathKey = 0;
        }

        $scope.showSelectedStory({
          previousComposite: previousComposite,
          previousUnique: previousUnique
        });
      };
    }]);
