angular.module('dbonyx')
.directive('characterLinks', [function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/characterLinks.html'
	} 
}])