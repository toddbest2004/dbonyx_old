angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.searchTerm=''
	$scope.realmInput=''
	$scope.filters=[]
	$scope.realms=[]
	$scope.realmInputSelected=false
	$scope.hoverIndex=''
	$scope.blurIn=function(element){
		if($scope.realms.length==0){
			$scope.getRealms()
		}
		$scope[element]=true
	}
	$scope.blurOut=function(element){
		$scope[element]=false
	}
	$scope.selectRealm = function(realm){
		$scope.realmInput=realm
	}
	$scope.hover=function(index){
		$scope.hoverIndex=index
	}
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
	$scope.getRealms=function(){
		console.log("getting realms")
		$http({
			method: 'GET',
			url: '/api/realms'
		}).then(function success(response){
			console.log(response)
			$scope.realms = response.data
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
}).directive('autoComplete', function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/autoComplete.html'
	}
})