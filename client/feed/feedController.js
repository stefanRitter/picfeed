angular.module('app').controller('feedController', ['$http', '$rootScope', 'currentUser', function ($http, $rootScope, currentUser) {
  /*jshint camelcase: false */
  'use strict';

  var vm = this;
  var handleError = function (error) {
    window.alert('an error occurred - please check console');
    console.log(error);
  };

  vm.tweets = [];
  vm.loadingText = 'fetching tweets...';
  vm.scrollTop = function () { window.scrollTo(0, 0); };
  vm.showLoadMore = true;

  vm.loadMore = function () {
    var lastTweet = vm.tweets[vm.tweets.length-1];
    vm.showLoadMore = false;
    $http
      .get('/feed/next?lastTweet='+lastTweet.id_str)
      .error(handleError)
      .success(function (res) {
        vm.tweets = vm.tweets.concat(res);
        if (res.length > 0) { vm.showLoadMore = true; }
      });
  };

  function refreshFeed () {
    $http
      .get('/feed/refresh')
      .error(handleError)
      .success(function (res) {
        vm.tweets = res;
      });
  }

  /*// Stream API socket listeners
  socket.on('tweet', function (tweet) {
    vm.tweets.unshift(tweet);
    $rootScope.$emit('newTweet');
    $rootScope.$digest();
  });

  socket.on('tweets', function (tweets) {
    vm.tweets = vm.tweets.concat(tweets);
    $rootScope.$digest();
  });*/

  if (!!currentUser.get()) {
    refreshFeed();
  }

  setTimeout(function () {
    vm.loadingText = 'Wow, so many images! Almost ready...';
    $rootScope.$digest();
    setTimeout(function () {
      if (vm.tweets.length === 0) {
        location.reload(true);
      }
    }, 1000);
  }, 8400/2);
}]);
