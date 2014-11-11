angular.module('app').controller('feedController', ['$http', '$rootScope', 'currentUser', function ($http, $rootScope, currentUser) {
  /*jshint camelcase: false */
  'use strict';

  var vm = this;
  var socket = window.io.connect();
  var handleError = function (error) {
    window.alert('an error occurred - please check console');
    console.log(error);
  };

  vm.tweets = [];
  vm.loadingText = 'fetching tweets...';
  vm.scrollTop = function () { window.scrollTo(0, 0); };

  vm.loadMore = function () {
    var lastTweet = vm.tweets[vm.tweets.length-1];
    $http
      .get('/feed/next', {lastTweet: lastTweet.id_str})
      .error(handleError)
      .success(function (res) {
        console.log(res);
      });
  };

  socket.on('tweet', function (tweet) {
    vm.tweets.unshift(tweet);
    $rootScope.$emit('newTweet');
    $rootScope.$digest();
  });

  socket.on('tweets', function (tweets) {
    vm.tweets = vm.tweets.concat(tweets);
    $rootScope.$digest();
  });

  socket.on('errorMessage', handleError);

  $rootScope.$on('userLoggedIn', function () {
    socket.emit('currentUser', currentUser.get());
  });

  setTimeout(function () {
    vm.loadingText = 'Wow, so many images! Almost ready...';
    $rootScope.$digest();
  }, 8400/2);
}]);
