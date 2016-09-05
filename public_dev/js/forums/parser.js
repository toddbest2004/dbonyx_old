'use strict';
angular.module('dbonyx')
.controller("parserCtrl", ["$scope", "$http", "$compile", function($scope, $http, $compile) {
	$scope.parse = function() {
		angular.element( document.getElementById('errorDiv')).html("");
		angular.element( document.getElementById('testDiv')).html("Parsing...");
		$http({
			url: "/api/forum/parser",
			method: "POST",
			data: {input:$scope.parsetext}
		}).then(function success(response){
			var el = $compile("<div>"+response.data+"</div>")($scope);
			angular.element( document.getElementById('testDiv')).html("").append(el);
		},function error(response){
			angular.element( document.getElementById('errorDiv')).html("").append(response.data);
		});
	};
}]);