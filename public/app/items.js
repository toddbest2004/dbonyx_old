angular.module('ItemCtrls', [])
.controller('itemCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.id = $routeParams.id
	$scope.item = "Loading Item"
	$scope.getItem = function(){
		var id = $scope.id
		$scope.loading=true
		$http({
			method: 'GET',
			url: '/api/item/'+id,
		}).then(function success(response){
			$scope.item=response.data
			$scope.loading=false
		}, function error(response){
			$scope.item=response.data
			$scope.loading=false
		})
	}
	$scope.getItem()
}]).directive('itemDisplay', function(){
	var controller = ['$scope', '$http', function($scope, $http){
		$scope.item="Loading"
		$scope.getItem = function(){
			var id = $scope.itemId
			$scope.loading=true
			$http({
				method: 'GET',
				url: '/api/item/'+id,
			}).then(function success(response){
				$scope.item=response.data.item
				$scope.loading=false
			}, function error(response){
				$scope.item=response.data
				$scope.loading=false
			})
		}
		$scope.getItem()
	}]
	return {
		controller: controller,
		restrict: 'E',
		replace: true,
		scope: {
			itemId:"@"
		},
		templateUrl: 'app/templates/itemDisplay.html'
	}
})