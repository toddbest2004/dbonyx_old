angular.module('dbonyx')
.controller('battlepetCtrl', ['$scope','$routeParams','$location','battlepetService',function($scope,$routeParams,$location,battlepetService){
	$scope.id = $routeParams.id
	$scope.petFamilies = battlepetService.petFamilies
	var searchValues = $location.search()
	// o=owner?

	$scope.applyChanges = function(){
		if(!$scope.pet.breedId)
			$scope.pet.breedId=parseInt(searchValues.b)||3
		if(!$scope.pet.level)
			$scope.pet.level=parseInt(searchValues.l)||1
		if(!$scope.pet.quality)
			$scope.pet.quality=parseInt(searchValues.q)||$scope.pet.qualityId||0
	}

	$scope.computeStats = function(){
		if(!$scope.pet.computed)
			$scope.pet.computed={}
		var qualityMultiplier = (1+$scope.pet.quality/10)
		var breed = battlepetService.breeds[$scope.pet.breedId]||battlepetService.breeds[0]
		var level = $scope.pet.level
		$scope.pet.computed.health = Math.round(100+($scope.pet.stats.health+breed.h*10)*level*qualityMultiplier)
		$scope.pet.computed.power = Math.round(($scope.pet.stats.power+breed.p*2)*level*qualityMultiplier)
		$scope.pet.computed.speed = Math.round(($scope.pet.stats.speed+breed.s*2)*level*qualityMultiplier)

	}

	$scope.getPet = function(){
		$scope.loading=true
		battlepetService.getOne($scope.id,{},function(err, pet){
			$scope.loading=false
			if(err)
				return $scope.error = err
			$scope.pet = pet
			$scope.applyChanges()
			$scope.computeStats()
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
	battlepet.breeds = {
		0:{h:0,p:0,s:0,n:"Unknown Breed"},
		3:{h:.25,p:.25,s:.25,n:"B/B"},
		4:{h:0,p:1,s:0,n:"P/P"},
		5:{h:0,p:0,s:1,n:"S/S"},
		6:{h:1,p:0,s:0,n:"H/H"},
		7:{h:.45,p:.45,s:0,n:"H/P"},
		8:{h:0,p:.45,s:.45,n:"P/S"},
		9:{h:.45,p:0,s:.45,n:"H/S"},
		10:{h:.2,p:.45,s:.2,n:"P/B"},
		11:{h:.2,p:.2,s:.45,n:"S/B"},
		12:{h:.45,p:.2,s:.2,n:"H/B"},
	}

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



