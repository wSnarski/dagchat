describe('Chat controller test', function() {
  beforeEach(module('dagchat'));
  var $controller;
  beforeEach(inject(function($rootScope, _$controller_){
    scope = $rootScope.$new();
    $controller = _$controller_;
  }));
  //TODO mock socket better, still getting instantiated.
    it('should select and deselect messages', function() {
      var fakeSocket = {
        forward: function() {}
      };
      var testChat = $controller('chatController',
      {$scope: scope, chatSocket: fakeSocket});
      scope.chatMessages = {'#12:1' : {'@rid': '#12:1', selected:false}};
      scope.selectMessage(scope.chatMessages['#12:1']);
      expect(Object.keys(scope.selectedMessages).length).toEqual(1);
      scope.clearSelected();
      expect(Object.keys(scope.selectedMessages).length).toEqual(0);
    });
});
