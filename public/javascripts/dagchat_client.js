var dagchat = angular.module('dagchat', [
'btford.socket-io',
'cfp.hotkeys',
'ui.bootstrap'
]).
factory('chatSocket', function (socketFactory) {
  return socketFactory();
});
