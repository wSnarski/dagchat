var dagchat = angular.module('dagchat', [
'btford.socket-io',
'cfp.hotkeys'
]).
factory('chatSocket', function (socketFactory) {
  return socketFactory();
});
