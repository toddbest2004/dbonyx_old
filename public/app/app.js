var app = angular.module('dbonyx', ['AuctionCtrls','ngRoute'])
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
$routeProvider
.when('/', {
	templateUrl: 'app/views/index.html'
})
.when('/auctions', {
	templateUrl: 'app/views/auctions.html'
})
.when('/database', {
	templateUrl: 'app/views/database.html'
})
.when('/character', {
	templateUrl: 'app/views/character.html'
})
.otherwise({
	templateUrl: 'app/views/404.html'
})

$locationProvider.html5Mode(true)
}])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	
}])
