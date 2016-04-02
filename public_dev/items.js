angular.module('ItemCtrls', [])
.factory('itemService', ['$http',function($http){
	var inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
	var item = {}
	item.getItem = function(itemId, modifiers, callback){
		var id = parseInt(itemId)
		$http({
			method: 'GET',
			url: '/api/item/pretty/'+id,
			modifiers: modifiers
		}).then(function success(response){
			var item=response.data.item
			callback(item)
		}, function error(response){
			callback(false)
		})
	}
	item.prettify = function(item){

	}
	return item
}])
.controller('itemCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.id = $routeParams.id
}]).directive('itemDisplay', function(){
	var controller = ['$scope', 'itemService',function($scope, itemService){
		// $scope.inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
		
		$scope.getItem = function(){
			$scope.item="Loading"
			$scope.loading=true
			itemService.getItem($scope.itemId, {}, function(item){
				$scope.item=item
				$scope.loading=false
			})
		}
		$scope.getItem()
	// $scope.inventoryType=function(){
	// 	return $scope.inventoryTypes[parseInt($scope.item.inventoryType)]
	// }
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
.directive('itemLink', [function(){
	var controller = ['$scope',function($scope){
		if($scope.quantity&&parseInt($scope.quantity)!==1){
			$scope.showQuantity=true
		}
	}]
	return {
		controller: controller,
		scope: {
			item: '=',
			quantity: '@'
		},
		replace: true,
		templateUrl: 'app/templates/itemLink.html'
	}
}])