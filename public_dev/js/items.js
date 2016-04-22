angular.module('ItemCtrls', [])
.factory('itemService', ['$http',function($http){
	// var inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
	var item = {}
	item.getItem = function(itemId, modifiers, callback){
		var id = parseInt(itemId)
		if(item.id===id){
			callback(item)
			return
		}
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
.factory('itemAuctionService', ['$http', function($http){
	var auctionDetails = {}
	auctionDetails.getItemAuctionDetails = function(id, realm, callback){
		$http({
			method: 'GET',
			url: '/api/auction/item/',
			params: {
				realm: realm,
				id:id
			}
		}).then(function success(response){
			alert('test1')
			callback(true)
		}, function error(response){
			alert('test2')
			callback(false)
		})
	}
	return auctionDetails
}])
.controller('itemCtrl', ['$scope','$routeParams','itemService', 'itemAuctionService',function($scope, $routeParams, itemService, itemAuctionService) {
	$scope.id = $routeParams.id
	$scope.auctionData = null
	$scope.realmInput = ''
	$scope.getItem = function(){
		$scope.item="Loading"
		$scope.loading=true
		itemService.getItem($scope.id, {}, function(item){
			console.log(item)
			$scope.item=item
			$scope.loading=false
		})
	}
	$scope.getAuctionDetails = function(){
		console.log($scope)
		$scope.auctionLoading = true
		itemAuctionService.getItemAuctionDetails($scope.id, $scope.realmInput, function(res){alert(res)})
	}
	$scope.getItem()
}]).directive('itemDisplay', function(){
	var controller = ['$scope', 'itemService',function($scope, itemService){
		
		$scope.getItem = function(){
			$scope.item="Loading"
			$scope.loading=true
			itemService.getItem($scope.itemId, {}, function(item){
				$scope.item=item
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