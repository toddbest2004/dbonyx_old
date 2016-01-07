angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.searchTerm=''
	$scope.realminput=''
	$scope.filters=[]
	$scope.search=function(e){
		e.preventDefault()
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {realm:$scope.realmInput,search:$scope.searchTerm}
		}).then(function success(response){
			console.log(response)
			$scope.testauctions=JSON.stringify(response.data)
			$scope.auctionResults=response.data
		}, function error(response){
			console.log(response)
		})
	}
}]).directive('auctionResult', function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/auctionResult.html'
	}
})
