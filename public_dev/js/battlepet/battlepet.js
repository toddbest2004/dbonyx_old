angular.module('dbonyx')
.controller('battlepetCtrl', ['$scope','$routeParams','$location','battlepetService',function($scope,$routeParams,$location,battlepetService){
	var searchValues = $location.search()
	// q=quality
	// l=level
	// b=breed
	// o=owner?
	$scope.id = $routeParams.id
}])
.controller('allpetsCtrl', ['$scope','$location','battlepetService',function($scope,$location,battlepetService){
	var searchValues = $location.search()

	$scope.offset=parseInt(searchValues.o)||0
	$scope.limit=parseInt(searchValues.l)||25

	$scope.test = typeof($scope.limit)
}])
.factory('battlepetService', ['$http', function($http){
	var battlepet = {}

	return battlepet
}])