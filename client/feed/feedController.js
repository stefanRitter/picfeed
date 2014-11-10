angular.module('app').controller('feedController', ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
  'use strict';

  var vm = this;
  var socket = window.io.connect();

  vm.tweets = [];
  vm.loadingText = 'fetching tweets...';
  
  socket.on('tweet', function (tweet) {
    console.log('new tweet');
    vm.tweets.unshift(tweet);
    $rootScope.$digest();
  });

  socket.on('tweets', function (tweets) {
    vm.tweets = vm.tweets.concat(tweets);
    $rootScope.$digest();
  });

  socket.on('errorMessage', function (error) {
    window.alert('error occurred - please check console');
    console.log(error.error);
  });

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });

  setTimeout(function () {
    vm.loadingText = 'Wow, so many images! almost ready...';
    $rootScope.$digest();
  }, 8400/2);
}]);
