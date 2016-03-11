angular.module('MenuCtrls', [])
.controller('MenuCtrl',['$scope', function($scope){
}])
.directive('menuBar', [function(){
	var menuBarController = ['$scope',function($scope){
		var timeoutId
		$scope.menus = []
		this.select = $scope.select = function(menu){
			$scope.hover = menu
			angular.forEach($scope.menus, function(menu){
				menu.selected=false
			})
			menu.selected=true
			$scope.menuSelected=true
		}

		this.off = $scope.off = function(){
			$scope.hover = false
			//this setTimeout makes the menus 'sticky' by waiting .5 seconds before
			//hiding the menu. If a new menu is selected before the time is up,
			//$scope.hover will be truthy, and the menu will stay shown
			//This catches the chance that a user has just moved to a new menu,
			//so the menu shouldn't be hidden
			timeoutId = setTimeout(function(){ 
				if(!$scope.hover){
					$scope.menuSelected=false
					$scope.$apply()
				}
			}, 500)
		}
		this.addMenu = function(menu){
			$scope.menus.push(menu)
		}
	}]
	return {
		restrict: 'E',
		transclude: true,
		scope: {},
		controller: menuBarController,
		templateUrl: 'app/templates/menuBar.html'
	}
}])
.directive('menu', [function(){
	return {
		require: '^^menuBar',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, menuCtrl) {
			console.log(menuCtrl)
			menuCtrl.addMenu(scope);
			element.on('mouseover', function(){
				menuCtrl.select(scope)
			})
			element.on('mouseleave', function(){
				menuCtrl.off()
			})
		},
		templateUrl: 'app/templates/menu.html'
	};
}])