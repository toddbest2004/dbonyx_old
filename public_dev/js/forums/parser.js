'use strict';
angular.module('dbonyx')
.controller("parserCtrl", ["$scope", "$http", "$compile", function($scope, $http, $compile) {
	$scope.parse = function() {
		angular.element( document.getElementById('errorDiv')).html("");
		angular.element( document.getElementById('testDiv')).html("Parsing...");
		$http({
			url: "/api/forum/preview",
			method: "POST",
			data: {message:$scope.parsetext}
		}).then(function success(response){
			var el = $compile("<div>"+response.data.preview+"</div>")($scope);
			$scope.parsedtext = response.data.preview;
			angular.element( document.getElementById('testDiv')).html("").append(el);
		},function error(response){
			$scope.parsedtext = response.data;
			angular.element( document.getElementById('errorDiv')).html("").append(response.data);
		});
	};
}]);