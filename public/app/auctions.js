angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	$scope.searchTerm=''
	$scope.realmInput='Ghostlands-US'
	$scope.filters=[]
	$scope.realms=[]
	$scope.realmInputSelected=false
	$scope.hoverIndex=''
	$scope.auctionPage=5
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
	$scope.selectRealm = function(realm){
		$scope.realmInput=realm
	}
	$scope.hover=function(index){
		$scope.hoverIndex=index
	}
	$scope.changePage=function(page){
		console.log(page)
		$scope.auctionPage=parseInt(page)
		$scope.search()
	}
	$scope.search=function(e){
		console.log("searching")
		if(e){
			e.preventDefault()
		}
		$http({
			method: 'GET',
			url: '/api/auction/fetchauctions',
			params: {realm:$scope.realmInput,search:$scope.searchTerm,offset:$scope.auctionPage*$scope.auctionLimit,limit:$scope.auctionLimit}
		}).then(function success(response){
			$scope.testauctions=JSON.stringify(response.data)
			$scope.auctionResults=response.data
		}, function error(response){
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
// 		function updatePages(){
// 			$scope.results = parseInt($scope.results)
// 			$scope.page = parseInt($scope.page)
// 			$scope.backPages = []
// 			$scope.nextPages = []
// 			var totalPages = Math.ceil($scope.max/$scope.limit)
// 			$scope.low = $scope.page*$scope.limit
// 			$scope.high = $scope.low+$scope.results
// 			for(var i=$scope.page-4;i<$scope.page;i++){
// 				if(i>=0){
// 					$scope.backPages.push(i+1)
// 				}
// 			}
// 			for(var i=$scope.page+1;i<$scope.page+6;i++){
// 				if(i<=totalPages){
// 					$scope.nextPages.push(i+1)
// 				}
// 			}
// 		}
// 		$scope.updatePage = function(page){
// 			$scope.page=parseInt(page)
// 			updatePages()
// 		}

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