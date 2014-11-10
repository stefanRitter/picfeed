angular.module('app').controller('feedController', [function () {
  'use strict';

  // TODO: 
  // 1. setup socket.io connection
  // 2. send user info
  // 3. push incoming tweets into array

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  
  socket.on('pong', function (message) {
    console.log(message);
  });

  socket.on('welcome', function (message) {
    console.log(message);
    socket.emit('ping', {});
  });
}]);
