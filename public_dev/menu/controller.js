angular.module('MenuCtrls', [])
.controller('MenuCtrl',['$scope', function($scope){
}])
.directive('menuHead', [function(){
	var controller = ['$scope', function($scope){
	}]
	return {
		restrict: 'E',
		replace: true,
		controller: controller,
		templateUrl: 'app/templates/menuHead.html',
		scope: {
			title: "@",
			selected: "="
		},

		link: function ($scope, $element, $attrs) {
			$element.on('mouseover', function () {
				console.log($attrs.title)
				$scope.selected=$attrs.title
				$scope.$apply()
			});
		}
	} 
}])
.directive('menuSub', [function(){
	var controller = ['$scope', function($scope){
	}]
	return {
		controller: controller,
		restrict: 'E',
		replace: true, 
		scope: {
			title: '@',
			selected: '='
		}, 
		templateUrl: 'app/templates/menuSub.html',
		transclude: true
	}
}])