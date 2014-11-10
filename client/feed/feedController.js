angular.module('app').controller('feedController', ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
  'use strict';

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  
  socket.on('tweet', function (tweet) {
    console.log('new tweet', tweet);
    vm.tweets.push(tweet);
  });

  socket.on('error', function (error) {
    window.alert('error occurred', error);
  });

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });
}]);
