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

      vm.scrollTop = function () {
        window.scrollTo(0, 0);
      };

      $rootScope.$on('newTweet', function () {
        vm.show = true;
      });
    }
  };
}]);
