"use strict";
angular.module('AuctionCtrls', [])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', 'onyxPersistence', 'auctionService', 'realmService', function($scope, $http, $location, $routeParams, onyxPersistence, auctionService, realmService) {
	var searchValues = $location.search();
	$scope.auctionService = auctionService;
	$scope.searchTerm=searchValues.s||'';
	$scope.realmInput=$routeParams.realm||'';

	$scope.validFilters = [{name:'Item Level',type:'Number'},{name:'Required Level',type:'Number'},{name:"Is Equippable",type:'Boolean'}];
	$scope.itemQualities = ['Poor','Common','Uncommon','Rare','Epic','Legendary','Artifact','Heirloom'];
	$scope.selectedQuality = '';

	$scope.auctionResults = auctionService.auctionResults;
	$scope.loading=false;
	$scope.filters=auctionService.filters;
	$scope.newfilter={};
	$scope.validComparators = null;
	$scope.qualities={values:[]};
	$scope.auctionSettings = auctionService.settings;
	// $scope.hoverIndex=''

	//start pagination

    var shuffleArray = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
    };
	realmService.getRealms(function() {
		$scope.realms = shuffleArray(realmService.realms);
	});

	$scope.setSortBy = function(sort) {
		// console.log(sort)
		auctionService.setSortBy(sort);
		$scope.search();
	};

	//auction filter functions
	$scope.updateFilter = function(){
		if($scope.validFilters[$scope.newfilter.type].type==='Number'){
			$scope.validComparators = ['>', '=', '<'];
			$scope.showFilterValue=true;
		}else if($scope.validFilters[$scope.newfilter.type].type==='Boolean') {
			$scope.validComparators = ['True', 'False'];
			$scope.showFilterValue=false;
		}
	};
	$scope.addFilter = function(){
		// alert('asdf')
		var type = $scope.validFilters[$scope.newfilter.type].name;
		var comparator = $scope.newfilter.comparator;
		var value = $scope.newfilter.value;
		auctionService.filters.push({type:type,comparator:comparator,value:value});
		$scope.newfilter={};
		$scope.showFilterValue=false;
		$scope.validComparators=null;
		$scope.search();
		// $scope.filters = auctionService.filters

		// console.log($scope.filters)
	};
	$scope.removeFilter = function(index) {
		auctionService.filters.splice(index,1);
		$scope.search();
	};
	var auctionUpdate = function(success){
		$scope.loading = false;
		$scope.auctionResults = auctionService.auctionResults;
		// console.log($scope.auctionResults)
		// $scope.updatePages()
		$scope.$broadcast("paginateUpdate");
	};
	// $scope.selectRealm
	$scope.search=function(e){
		if(e){
			e.preventDefault();
		}
		$scope.loading=true;

		auctionService.qualities=$scope.qualities.values.map(function(a, b){
			if(a) {
				return b.toString();
			}
			return null;
		}).filter(function(a){return a;});
		auctionService.filters=$scope.filters;
		auctionService.setSearchTerm($scope.searchTerm);
		auctionService.setRealm($scope.realmInput);
		auctionService.search(auctionUpdate);
	};
	if($scope.realmInput){
		$scope.search();
	}
}]);