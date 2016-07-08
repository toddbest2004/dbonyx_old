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
			params: {modifiers:modifiers||{}}
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
			// alert('test1')
			callback(true)
		}, function error(response){
			// alert('test2')
			callback(false)
		})
	}
	return auctionDetails
}])
.controller('itemCtrl', ['$scope','$routeParams','itemService', 'itemAuctionService',function($scope, $routeParams, itemService, itemAuctionService) {
	$scope.id = $routeParams.id
	$scope.auctionData = null
	$scope.realmInput = ''
	$scope.modifiers = {}
	if($routeParams.rand){
		$scope.modifiers.rand=parseInt($routeParams.rand)
	}
	$scope.getItem = function(){
		$scope.item="Loading"
		$scope.loading=true
		itemService.getItem($scope.id, $scope.modifiers, function(item){
			// console.log(item)
			$scope.item=item
			$scope.loading=false
		})
	}
	$scope.getAuctionDetails = function(){
		// console.log($scope)
		$scope.auctionLoading = true
		itemAuctionService.getItemAuctionDetails($scope.id, $scope.realmInput, function(res){
			// alert(res)
		})
	}
	$scope.getItem()
}]).directive('itemDisplay', function(){
	var controller = ['$scope', 'itemService',function($scope, itemService){
		$scope.getItem = function(){
			$scope.item="Loading"
			$scope.loading=true
			itemService.getItem($scope.itemId, $scope.modifiers, function(item){
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
			itemId:"@",
			modifiers:"="
		},
		templateUrl: 'app/templates/itemDisplay.html'
	}
})
.directive('itemLink', [function(){
	var controller = ['$scope',function($scope){
		if(!$scope.item){ //defaults if item isn't passed properly
			$scope.item={name:"Unknown Item", itemId:0,_id:0};
		}
		$scope.itemLinkPath = "/item/"+$scope.item.itemId;

		var options = []
		if($scope.rand!=='0'&&$scope.rand!==undefined){
			options.push('rand='+$scope.rand)
		}

		if(options.length){
			$scope.itemLinkPath+='?'
			options.forEach(function(option, index){
				$scope.itemLinkPath+=option
				if(index<options.length-1)
					$scope.itemLinkPath+='&'
			})
		}

		if($scope.quantity&&parseInt($scope.quantity)!==1){
			$scope.showQuantity=true
		}


	}]
	return {
		controller: controller,
		scope: {
			item: '=',
			quantity: '@',
			rand: '@'
		},
		replace: true,
		templateUrl: 'app/templates/itemLink.html'
	}
}])
.directive('itemHover', ['$compile','$window',function($compile,$window){
	return {
		restrict: "A",
		link: function(scope, element, attributes){
			var itemDisplay
			element.bind('mouseover', function(e){
				var css = {
					left: (e.clientX+$window.scrollX+5) + 'px',
					top: (e.clientY+$window.scrollY) + 'px'
				}
				if(!scope.el){
					var item = scope.item||scope.$parent.item
					var itemId = item.id||item._id||item.itemId
					if(itemDisplay){
						itemDisplay.remove()
					}
					
					scope.el = angular.element("<div class='itemHover'>")
					itemDisplay = scope.el.append($compile("<item-display item-id='"+itemId+"' modifiers='item'>")(scope))
					angular.element(document.body).append(itemDisplay)
					
					itemDisplay.css(css)
				}else{
					angular.element(document.body).append(scope.el)
					scope.el.css(css)
				}
			})

			element.bind('mouseleave', function(){
				destroy()
			})

			element.on('$destroy', function(){
				destroy()
			})

			var destroy = function(){
				if(itemDisplay){
					itemDisplay.remove()
				}
			}
		}
	}
}])