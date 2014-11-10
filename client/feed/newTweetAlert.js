angular.module('app').directive('newTweetAlert', ['$rootScope', function ($rootScope) {
  'use strict';

  return {
    restrict: 'A',
    templateUrl: '/assets/html/feed/newTweetAlert',
    replace: true,
    scope: {},
    
    link: function ($scope) {
      var vm = $scope;
      vm.show = false;

      $rootScope.$on('newTweet', function () {
        vm.show = true;
      });
    }
  };
}]);
