angular.module('AuctionCtrls', [])
.factory('auctionService', ['$http',function($http){
	var auction = {
		searchTerm: '',
		realmInput: '',
		filters: [],
		qualities:[],
		sortBy: 'buyout',
		sortOrder: -1,
		resultPages: 0,
		currentPage: 1,
		resultHigh:0,
		resultLow:0,
		limit: 25,
		loading: false,
		auctionResults: false
	}
	auction.setSearchTerm = function(term){
		auction.searchTerm = term
	}
	auction.setRealm = function(realm){
		auction.realmInput = realm
	}
	auction.noMatch=function(){
		auction.loading=false
		auction.auctionResults=[]
		auction.resultPages = 0
		auction.resultLow = 0
		auction.resultHigh = 0
	}
	auction.search = function(callback){
		if(!auction.realmInput.length){
			auction.noMatch()
			callback(false)
			return
		}
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {
				'qualities[]':auction.qualities,
				'filters[]':auction.filters,
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
			callback(true)
		}, function error(response){
			auction.noMatch()
			// console.log(response)
			callback(false)
		})
	}
	auction.setSortBy=function(sort){
		if(auction.sortBy===sort){//if clicking on same column, reverse the order
			auction.sortOrder*=-1
		}else{//otherwise set it
			auction.sortBy=sort
			auction.sortOrder=-1
		}
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
	var searchValues = $location.search()
	$scope.searchTerm=searchValues.s||''
	$scope.realmInput=searchValues.r||onyxPersistence.getRealm()||''

	$scope.validFilters = ['Item Level','Required Level']

	$scope.realms=[]
	$scope.auctionResults = auctionService.auctionResults
	$scope.loading=false
	$scope.filters=auctionService.filters 
	$scope.qualities={values:[]}
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
		$scope.qualities=[]
		$scope.firstPage()
	}
	$scope.setSortBy=function(sort){
		// console.log(sort)
		auctionService.setSortBy(sort)
		$scope.search()
	}
	$scope.addFilter = function(){
		// alert('asdf')
		auctionService.filters.push({type:'0',comparator:'>',value:''})
		// $scope.filters = auctionService.filters

		// console.log($scope.filters)
	}
	$scope.removeFilter = function(index){
		auctionService.filters.splice(index,1)
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

		auctionService.qualities=$scope.qualities.values
		auctionService.filters=$scope.filters
		auctionService.setSearchTerm($scope.searchTerm)
		auctionService.setRealm($scope.realmInput)
		auctionService.search(auctionUpdate)
	}
	if($scope.realmInput){
		$scope.search()
	}
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
	var controller = ['$scope', function($scope){
		$scope.toggleHistory = function(){
			$scope.showAuctionHistory=!$scope.showAuctionHistory
		}
	}]
	return {
		restrict: 'E',
		replace: true,
		controller: controller,
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
				// console.log(response.data)
			}, function error(response){
				// console.log(response.data)
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
}).directive('auctionHistory', function(){
	//expects $scope.item to be an instance of Item
	var controller = ['$scope', 'auctionHistory',function($scope, auctionHistory){
		if($scope.item){
			auctionHistory.search($scope.item._id,$scope.realmInput,function(err, data){
				$scope.aucHistoryLoading=false
				if(err||!data){
					//TODO: handle Error
					return err
				}
				$scope.histories=data.histories
				$scope.count=$scope.histories.length
				$scope.barwidth=Math.floor(480/$scope.count)
				$scope.barheight=280
				$scope.width=$scope.barwidth*$scope.count
				for(var i=0;i<$scope.histories.length;i++){
					var averagePrice = parseInt($scope.histories[i].sellingPrice/$scope.histories[i].sold)
					$scope.histories[i].x=$scope.barwidth*i
					$scope.histories[i].y=$scope.barheight-(($scope.barheight-25)*averagePrice/data.max)
					$scope.histories[i].averagePrice = averagePrice
					// $scope.histories[i].texty = $scope.histories[i].y-10
					// $scope.histories[i].textx = $scope.histories[i].x+$scope.barwidth*.5
					// if($scope.histories[i].textx>($scope.width*.5)){
					// 	$scope.histories[i].textx-=($scope.histories[i].averagePrice.length*7)
					// }
					$scope.histories[i].soldy=$scope.barheight+(40-40*($scope.histories[i].sold/data.maxQuantity))
					$scope.histories[i].soldheight=40*($scope.histories[i].sold/data.maxQuantity)
					$scope.histories[i].expiredheight=40*($scope.histories[i].expired/data.maxQuantity)
					$scope.histories[i].expiredy=$scope.histories[i].soldy-$scope.histories[i].expiredheight
					// console.log($scope.histories[i].expiredheight,$scope.histories[i].soldheight)
					// console.log($scope.histories[i].expiredy,$scope.histories[i].soldy)
				}
			})
		}
		$scope.aucHistoryLoading=true

		$scope.hoverIn = function(index){
			$scope.histories[index].selected=true
			$scope.selected = $scope.histories[index]
		}
		$scope.hoverOut = function(index){
			$scope.histories[index].selected=false
			$scope.selected = false
		}
	}]
	return {
		restrict: 'E',
		controller: controller,
		scope:{
			item:"=",  
			showAuctionHistory: "&",
			realmInput: "=" 
		},
		templateUrl: 'app/templates/auctionHistory.html'
	}
}).factory('auctionHistory',['$http',function($http){
	var history = {}
	history.search = function(item, realmInput, cb){
		$http({
			method: 'GET',
			url: '/api/auction/auctionHistory',
			params: {
				item:item,
				realm: realmInput
			}
		}).then(function success(response){
			cb(null,response.data)
		}, function error(response){
			cb(response.data,null)
		})
	}
	return history
}])




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