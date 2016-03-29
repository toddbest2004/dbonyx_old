angular.module('AuctionCtrls', [])
.factory('auctionService', ['$http',function($http){
	var auction = {
		searchTerm: '',
		realmInput: '',
		filters: {qualities:[]},
		sortBy: 'buyout',
		sortOrder: -1,
		resultPages: 0,
		currentPage: 1,
		resultHigh:0,
		resultLow:0,
		limit: 25,
		loading: false,
		auctionResults: []
	}
	auction.setSearchTerm = function(term){
		auction.searchTerm = term
	}
	auction.setRealm = function(realm){
		auction.realmInput = realm
	}
	auction.search = function(callback){
		if(!auction.realmInput){
			//cb false
			return
		}
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {
				filters:auction.filters,
				searchTerm:auction.searchTerm,
				realm:auction.realmInput,
				offset:(auction.currentPage-1)*auction.limit,
				limit:auction.limit,
				sortBy:auction.sortBy,
				sortOrder:auction.sortOrder
			}
		}).then(function success(response){
			auction.loading=false
			auction.auctionResults=response.data
			auction.resultPages = Math.ceil(auction.auctionResults.count/auction.limit)
			auction.resultLow = (auction.currentPage-1)*auction.limit
			auction.resultHigh = auction.resultLow+auction.auctionResults.auctions.length 
			// $scope.updatePages()
			callback(true)
		}, function error(response){
			auction.loading=false
			// console.log(response)
			callback(false)
		})
	}
	auction.updatePage = function(page){
		page=parseInt(page)
		if(page>auction.resultPages){
			page=auction.resultPages
		}
		if(page<1){
			page=1
		}
		auction.currentPage=page
	}
	auction.firstPage = function(){
		auction.updatePage(1)
	}
	auction.backPage = function(){
		auction.updatePage(auction.currentPage-1)
	}
	auction.nextPage = function(){
		auction.updatePage(auction.currentPage+1)
	}
	auction.lastPage = function(){
		auction.updatePage(auction.resultPages)
	}

	return auction
}])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', 'onyxPersistence', 'auctionService',function($scope, $http, $location, $routeParams, onyxPersistence, auctionService) {
	$scope.searchTerm=''
	$scope.realmInput=onyxPersistence.getRealm()
	$scope.realms=[]
	$scope.auctionResults = auctionService.auctionResults
	$scope.loading=false
	$scope.filters=auctionService.filters
	// $scope.hoverIndex=''

	$scope.updatePages=function(){
		$scope.backPages = []
		$scope.nextPages = []
		$scope.low = auctionService.resultLow
		$scope.high = auctionService.resultHigh
		for(var i = auctionService.currentPage-5;i<auctionService.currentPage;i++){
			if(i>0){
				$scope.backPages.push(i)
			}
		}
		for(var i=auctionService.currentPage+1;i<=auctionService.currentPage+5;i++){
			if(i<=auctionService.resultPages){
				$scope.nextPages.push(i)
			}
		}
		$scope.currentPage=auctionService.currentPage
	}
	$scope.updatePage = function(page){
		auctionService.updatePage(page)
		$scope.search()
	}
	$scope.firstPage = function(){
		auctionService.firstPage()
		$scope.search()
	}
	$scope.nextPage = function(){
		auctionService.nextPage()
		$scope.search()
	}
	$scope.backPage = function(){
		auctionService.backPage()
		$scope.search()
	}
	$scope.lastPage = function(){
		auctionService.lastPage()
		$scope.search()
	}
	$scope.clearQualityFilter=function(){
		$scope.filters.qualities=[]
		$scope.firstPage()
	}
	var auctionUpdate = function(success){
		$scope.loading = false
		$scope.auctionResults = auctionService.auctionResults
		$scope.updatePages()
	}
	// $scope.selectRealm
	$scope.search=function(e){
		if(e){
			e.preventDefault()
		}
		$scope.loading=true
		// $scope.updatePages()
		auctionService.filters=$scope.filters
		auctionService.setSearchTerm($scope.searchTerm)
		auctionService.setRealm($scope.realmInput)
		auctionService.search(auctionUpdate)
	}
	$scope.search()
}]).directive('selectOnFocus', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]).directive('auctionResult', function(){
	// var controller = ['$scope', function($scope){
	// }]
	return {
		restrict: 'E',
		replace: true,
		// controller: controller,
		templateUrl: 'app/templates/auctionResult.html'
	} 
}).directive('watchlistForm', function(){
	//expects $scope.item to be an instance of Item
	var controller = ['$scope', '$http', 'onyxUser', function($scope, $http, onyxUser){
		$scope.user = onyxUser
		$scope.minQuantity=1
		if($scope.item){
			$scope.maxQuantity = $scope.item.stackable||9999
		}else{
			//defaults in case item isn't passed
			$scope.maxQuantity=9999
		}
		if(!$scope.price){
			$scope.price=0
		}
		$scope.originalPrice=$scope.price
		$scope.gold = Math.floor($scope.price/10000)
		$scope.silver = Math.floor(($scope.price%10000)/100)
		$scope.copper = $scope.price%100
		$scope.submit = function(){
			var price = parseInt($scope.copper+$scope.silver*100+$scope.gold*10000)
			$http({
				method: 'POST',
				url: '/api/watchlist',
				data: {
					price: price,
					item: $scope.item._id,
					min: $scope.minQuantity,
					max: $scope.maxQuantity,
					realm: $scope.realmInput
				} 
			}).then(function success(response){
				console.log(response.data)
			}, function error(response){
				console.log(response.data)
			}) 
		}
	}]
	return {
		restrict: 'E',
		controller: controller,
		scope:{
			item:"=",
			price: "@",
			showWatchlist: "=",
			realmInput: "=" 
		},
		templateUrl: 'app/templates/watchlist.html'
	}
}).directive('autoComplete', function(){
	var autoCompleteCtrl = ['onyxPersistence', '$scope', '$http', function(onyxPersistence, $scope, $http){
		$scope.realmInputSelected=false
		$scope.realms=[]
		$scope.blurIn=function(element){
			if($scope.realms.length==0){
				$scope.getRealms()
			}
			$scope[element]=true
		}
		$scope.blurOut=function(element){
			$scope[element]=false
		}
		$scope.getRealms=function(){
			$scope.realms=['Loading Realms']
			$http({
				method: 'GET',
				url: '/api/realms'
			}).then(function success(response){
				$scope.realms = response.data
			}, function error(response){
				$scope.realms=['Unable to Load Realms']
			})
		}
		$scope.selectRealm = function(realm){
			$scope.realmInput=realm
			onyxPersistence.setRealm(realm)
			setTimeout($scope.search,0)
		}
		$scope.hover=function(index){
			$scope.hoverIndex=index
		}
	}]
	return {
		restrict: 'E',
		replace: true,
		scope: {
			realmInput: '=',
			search: "&"
		},
		templateUrl: 'app/templates/autoComplete.html',
		controller: autoCompleteCtrl
	}
})
.directive('money', function(){
	var moneyCtrl = ['$scope', function($scope){
		$scope.amount = parseInt($scope.amount)
		$scope.copper = $scope.amount%100
		$scope.silver = parseInt($scope.amount/100)%100
		$scope.gold = parseInt($scope.amount/10000)
	}]

	return {
		restrict: 'E',
		replace: true,
		scope: {
			amount: '='
		},
		templateUrl: 'app/templates/money.html',
		controller: moneyCtrl
	}
})
// // .directive('pagination', function(){
// // 	var controller = ['$scope', function($scope){
// // 		$scope.backPages = []
// // 		$scope.nextPages = []
// // 		$scope.high=0
// // 		$scope.low=0


// // 		updatePages()
// // 	}]
// // 	return {
// // 		scope: {
// // 			page: "@",
// // 			max: "@",
// // 			limit: "@",
// // 			results: "@"
// // 		},
// // 		controller: controller,
// // 		restrict: 'E',
// // 		replace: true,
// // 		templateUrl: 'app/templates/pagination.html'
// // 	}
// // })