angular.module('AuctionCtrls')
.directive('auctionResult', function(){
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
})
.directive('onyxPagination', [function(){
	//<onyx-pagination>
	//takes three arguments:
	//
	//paginate: a link to an object containing:
	//  count: the total number of items (NOT pages) to paginate
	//  limit: the number of items expected to be shown per page
	//  offset: the current index of the first item of the page
	//
	//term: Showing {{term}} 1-50 of 100
	//
	//update(): A function to be called whenever a page change is requested
	//  will be called AFTER the new offset has been determined.

	var controller = ['$scope', '$timeout', function($scope, $timeout){
		$scope.updatePages=function(change){
			$scope.backPages = []
			$scope.nextPages = []
			$scope.total = $scope.paginate.count;
			$scope.resultPages = Math.ceil($scope.total/$scope.paginate.limit);
			$scope.currentPage = $scope.paginate.offset/$scope.paginate.limit+1;
			$scope.low = $scope.paginate.offset;
			$scope.high = Math.min($scope.paginate.offset+$scope.paginate.limit,$scope.total);
			for(var i = $scope.currentPage-5;i<$scope.currentPage;i++){
				if(i>0){
					$scope.backPages.push(i)
				}
			}
			for(var i=$scope.currentPage+1;i<=$scope.currentPage+5;i++){
				if(i<=$scope.resultPages){
					$scope.nextPages.push(i)
				}
			}
			if(change){
				$scope.update();
			}
		}

		$scope.setPage = function(page){
			$scope.paginate.offset = (page-1)*$scope.paginate.limit;
			$scope.updatePages(true);
		}
		$scope.firstPage = function(){
			$scope.paginate.offset=0;
			$scope.updatePages(true);
		}
		$scope.nextPage = function(){
			$scope.paginate.offset+=$scope.paginate.limit;
			if($scope.paginate.offset>$scope.paginate.count){
				$scope.paginate.offset=Math.floor($scope.paginate.count/$scope.paginate.limit)*$scope.paginate.limit;
			}
			$scope.updatePages(true);
		}
		$scope.backPage = function(){
			$scope.paginate.offset-=$scope.paginate.limit;
			if($scope.paginate.offset<0){
				$scope.paginate.offset=0;
			}
			$scope.updatePages(true);
		}
		$scope.lastPage = function(){
			$scope.paginate.offset=Math.floor($scope.paginate.count/$scope.paginate.limit)*$scope.paginate.limit;
			$scope.updatePages(true);
		}
		$scope.updatePages(true);
	}];
	return {
		restrict: 'E',
		controller: controller,
		scope:{
			paginate:'=', //the service...
			term: '@',
			update:'&', //function to change pages (usually on click)
		},
		link: function(scope){
			scope.$on("paginateUpdate", function(){
				scope.updatePages(false);
			})
		},
		templateUrl: 'app/templates/pagination.html'
	}
}]);