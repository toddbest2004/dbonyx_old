angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.searchTerm=''
	$scope.filters=[]
	$scope.search=function(e){
		e.preventDefault()
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {region:'us',realm:'ghostlands'}
		}).then(function success(response){
			console.log(response)
			$scope.testauctiondata=JSON.stringify(response.data)
		}, function error(response){
			console.log(response)
		})
	}
}])
