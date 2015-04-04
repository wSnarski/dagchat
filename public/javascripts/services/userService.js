dagchat.factory('userService',
['$scope', 'chatSocket'],
function userService($scope, $chatSocket){
  var currentUser;
  return function() {
    return {
      login: function(email) {
        currentUser = email;
      },
      logout: function() {
        currentUser = undefined;
      },
      isLoggedIn: function() {
        return currentUser !== undefined;
      },
      currentUser: function() {
        return currentUser;
      }
    }
  };
});
