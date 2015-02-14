describe('Chat controller test', function() {
  beforeEach(module('dagchat'));
  var $controller;
  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));
  describe('first', function() {
    it('should run succesfully', function() {
      var $scope = {};
      var fakeSocket = {};
      var testChat = $controller('chatController',
      {$scope: $scope, chatSocket: fakeSocket});
      $scope.selectedMessages = {'#12:1': true};
      $scope.clearSelected();
      expect($scope.selectedMessages).toEqual({});
    });
  });
});
