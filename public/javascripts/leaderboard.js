var app = angular.module('ctf', []);

function leaderboard($scope, $http) {
  $scope.leaderboardInit = function() {
    $http.get("/userInfo").success(function (response) {
      console.log(response);
      $scope.stats = response.stats;
      $scope.users = response.users;
    });
  };
}
