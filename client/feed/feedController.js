angular.module('app').controller('feedController', ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
  'use strict';

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  
  socket.on('tweet', function (tweet) {
    vm.tweets.push(tweet);
  });

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });
}]);
