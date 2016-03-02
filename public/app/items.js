angular.module('ItemCtrls', [])
.controller('itemCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.id = $routeParams.id
}]).directive('itemDisplay', function(){
	var controller = ['$scope', '$http', function($scope, $http){
		$scope.inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
	
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

	$scope.inventoryType=function(){
		return $scope.inventoryTypes[parseInt($scope.item.inventoryType)]
	}
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