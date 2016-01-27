angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams, ) {
	$scope.searchTerm=''
	$scope.realmInput=''
	$scope.filters=[]
	$scope.qualities=[]
	$scope.realms=[]
	$scope.realmInputSelected=false
	$scope.hoverIndex=''
	$scope.totalPages=0
	$scope.auctionPage=1
	$scope.currentPage=1
	$scope.auctionLimit=25
	$scope.blurIn=function(element){
		if($scope.realms.length==0){
			$scope.getRealms()
		}
		$scope[element]=true
	}
	$scope.blurOut=function(element){
		$scope[element]=false
	}
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
	$scope.selectRealm = function(realm){
		$scope.realmInput=realm
		$scope.firstPage()
	}
	$scope.hover=function(index){
		$scope.hoverIndex=index
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
}]).directive('selectOnFocus', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
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
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/autoComplete.html'
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