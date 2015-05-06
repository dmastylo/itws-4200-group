var app = angular.module('myApp', []);
function leaderboard($scope, $http){
	
	$http.get("/userInfo").success(function (response) {
		console.dir(response);
		$scope.names = response.records;
	});
};