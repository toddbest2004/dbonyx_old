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
	$scope.petFamilies = ['Humanoid','Dragonkin','Flying','Undead','Critter','Magical','Elemental','Beast','Aquatic','Mechanical']
	$scope.offset=parseInt(searchValues.o)||0
	$scope.limit=parseInt(searchValues.l)||25
	$scope.filters={families:[]}
	$scope.loading=true
	
	$scope.search = function(){
		battlepetService.filters=$scope.filters
		battlepetService.getAll($scope.offset,$scope.limit, function(err, data){
			$scope.loading=false
			if(err)
				return $scope.error = err
			$scope.pets = data
		})
	}
	$scope.search()
}])
.factory('battlepetService', ['$http', function($http){
	var battlepet = {}
	battlepet.filters = {}
	battlepet.getAll = function(offset, limit, cb){
		$http({

			method: 'GET',
			url: '/api/battlepet/',
			params: {
				offset: offset,
				limit: limit,
				filters: battlepet.filters
			}
		}).then(function success(response){
			cb(null, response.data)
		}, function error(response){
			cb(response.error)
		})
	}

	return battlepet
}])



