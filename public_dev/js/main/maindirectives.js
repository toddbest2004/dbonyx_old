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
}]).directive('autoComplete', function(){
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