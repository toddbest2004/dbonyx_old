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
	$scope.filters={}
	$scope.loading=true
	battlepetService.getAll($scope.offset,$scope.limit,$scope.filters, function(err, data){
		$scope.loading=false
		if(err)
			return $scope.error = err
		$scope.pets = data
	})
	
}])
.factory('battlepetService', ['$http', function($http){
	var battlepet = {}

	battlepet.getAll = function(offset, limit, filters, cb){
		$http({

			method: 'GET',
			url: '/api/battlepet/',
			params: {
				offset: offset,
				limit: limit,
				filters: filters
			}
		}).then(function success(response){
			console.log(response)
			cb(null, response.data)
		}, function error(response){
			console.log(response)
			cb(response.error)
		})
	}

	return battlepet
}])



