angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', 'onyxPersistence', function($scope, $http, $location, $routeParams, onyxPersistence) {
	$scope.searchTerm=''
	$scope.realmInput=onyxPersistence.getRealm()
	$scope.filters=[]
	$scope.qualities=[]
	$scope.realms=[]
	$scope.hoverIndex=''
	$scope.totalPages=0
	$scope.auctionPage=1
	$scope.currentPage=1
	$scope.auctionLimit=25

	$scope.updatePages=function(){
		$scope.backPages = []
		$scope.nextPages = []
		$scope.totalPages = Math.ceil($scope.auctionResults.count/$scope.auctionLimit)
		$scope.low = ($scope.auctionPage-1)*$scope.auctionLimit
		$scope.high = $scope.low+$scope.auctionResults.auctions.length
		for(var i=$scope.auctionPage-5;i<$scope.auctionPage;i++){
			if(i>0){
				$scope.backPages.push(i)
			}
		}
		for(var i=$scope.auctionPage+1;i<=$scope.auctionPage+5;i++){
			if(i<=$scope.totalPages){
				$scope.nextPages.push(i)
			}
		}
		$scope.currentPage=$scope.auctionPage
	}
	$scope.updatePage = function(page){
		page=parseInt(page)
		if(page>$scope.totalPages){
			page=$scope.totalPages
		}
		if(page<1){
			page=1
		}
		$scope.auctionPage=page
		$scope.search()
	}
	$scope.firstPage = function(){
		$scope.updatePage(1)
	}
	$scope.nextPage = function(){
		$scope.updatePage($scope.auctionPage+1)
	}
	$scope.backPage = function(){
		$scope.updatePage($scope.auctionPage-1)
	}
	$scope.lastPage = function(){
		$scope.updatePage($scope.totalPages)
	}
	$scope.changePage=function(page){
		$scope.auctionPage=parseInt(page)
		$scope.search()
	}
	$scope.clearQualityFilter=function(){
		$scope.qualities=[]
		$scope.firstPage()
	}
	$scope.search=function(e){
		if(e){
			e.preventDefault()
		}
		$scope.loading=true
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {filters:$scope.filters,qualities:$scope.qualities,searchTerm:$scope.searchTerm,realm:$scope.realmInput,offset:($scope.auctionPage-1)*$scope.auctionLimit,limit:$scope.auctionLimit}
		}).then(function success(response){
			$scope.loading=false
			$scope.auctionResults=response.data
			$scope.updatePages()
		}, function error(response){
			$scope.loading=false
			console.log(response)
		})
	}
	$scope.init=function(){
		if($scope.realmInput){
			$scope.firstPage()
		}
	}
	$scope.init()
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
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/auctionResult.html'
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
// .directive('pagination', function(){
// 	var controller = ['$scope', function($scope){
// 		$scope.backPages = []
// 		$scope.nextPages = []
// 		$scope.high=0
// 		$scope.low=0


// 		updatePages()
// 	}]
// 	return {
// 		scope: {
// 			page: "@",
// 			max: "@",
// 			limit: "@",
// 			results: "@"
// 		},
// 		controller: controller,
// 		restrict: 'E',
// 		replace: true,
// 		templateUrl: 'app/templates/pagination.html'
// 	}
// })