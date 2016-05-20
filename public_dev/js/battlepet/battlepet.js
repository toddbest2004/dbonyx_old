angular.module('dbonyx')
.controller('battlepetCtrl', ['$scope','$routeParams','$location','battlepetService',function($scope,$routeParams,$location,battlepetService){
	$scope.id = $routeParams.id
	$scope.petFamilies = battlepetService.petFamilies
	var searchValues = $location.search()
	// q=quality
	// l=level
	// b=breed
	// o=owner?
	$scope.getPet = function(){
		$scope.loading=true
		battlepetService.getOne($scope.id,{},function(err, pet){
			$scope.loading=false
			if(err)
				return $scope.error = err
			$scope.pet = pet
		})
	}
	$scope.getPet()
}])
.controller('allpetsCtrl', ['$scope','$location','battlepetService',function($scope,$location,battlepetService){
	var searchValues = $location.search()
	$scope.petFamilies = battlepetService.petFamilies
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
	battlepet.petFamilies = ['Humanoid','Dragonkin','Flying','Undead','Critter','Magical','Elemental','Beast','Aquatic','Mechanical']
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

	battlepet.getOne = function(id, modifiers, cb){
		id=parseInt(id)
		modifiers=modifiers||{}
		$http({
			url: '/api/battlepet/'+id,
			params: {
				modifiers: modifiers
			}
		}).then(function success(response){
			cb(null, response.data)
		}, function error(response){
			cb(response.error)
		})
	}

	return battlepet
}])



