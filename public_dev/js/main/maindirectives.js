angular.module('dbonyx')
.directive('sidebar', [function(){
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		templateUrl: 'app/templates/sidebar.html'
	}
}])
.directive('mainContent', [function(){
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		templateUrl: 'app/templates/mainContent.html'
	}
}])
.directive('onyxFooter', [function(){
	return {
		templateUrl: 'app/templates/footer.html'
	}
}])
.directive('selectOnFocus', ['$window', function ($window) {
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
}]).directive('autoComplete', [function(){
	var autoCompleteCtrl = ['onyxPersistence', '$scope', 'realmService',function(onyxPersistence, $scope, realmService){
		$scope.realmInputSelected=false
		$scope.realms=realmService.realms
		$scope.blurIn=function(element){
			// if($scope.realms.length==0){
				$scope.getRealms()
			// }
			$scope[element]=true
		}
		$scope.blurOut=function(element){
			$scope[element]=false
		}
		$scope.getRealms=function(){
			// $scope.realms=['Loading Realms']
			realmService.getRealms(function(){
				$scope.realms=realmService.realms
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
}])
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
			if($scope.paginate.offset>$scope.paginate.count){
				$scope.paginate.offset = Math.floor($scope.paginate.count/$scope.paginate.limit)*$scope.paginate.limit;
			}
			$scope.backPages = []
			$scope.nextPages = []
			$scope.total = $scope.paginate.count;
			$scope.resultPages = Math.ceil($scope.total/$scope.paginate.limit);
			$scope.currentPage = Math.floor($scope.paginate.offset/$scope.paginate.limit)+1;
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