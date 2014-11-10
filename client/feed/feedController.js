angular.module('app').controller('feedController', ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
  'use strict';

  // TODO: 
  // 2. send user info
  // 3. push incoming tweets into array

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  
  socket.on('pong', function (message) {
    console.log(message);
  });

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });
}]);
