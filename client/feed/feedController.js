angular.module('app').controller('feedController', ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
  'use strict';

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  
  socket.on('tweet', function (tweet) {
    vm.tweets.push(tweet);
    $rootScope.$digest();
  });

  socket.on('errorMessage', function (error) {
    window.alert('error occurred - please check console');
    console.log(error.error);
  });

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });
}]);
