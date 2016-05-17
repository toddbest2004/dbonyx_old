angular.module('AuctionCtrls', ['oi.select'])
.controller('AuctionCtrl', ['$scope', '$http', '$location', '$routeParams', 'onyxPersistence', 'auctionService', 'oiSelect', function($scope, $http, $location, $routeParams, onyxPersistence, auctionService, oiSelect) {
	var searchValues = $location.search()
	$scope.searchTerm=searchValues.s||''
	$scope.realmInput=searchValues.r||onyxPersistence.getRealm()||''

	$scope.validFilters = [{name:'Item Level',type:'Number'},{name:'Required Level',type:'Number'},{name:"Is Equippable",type:'Boolean'}]
	$scope.itemQualities = ['Poor','Common','Uncommon','Rare','Epic','Legendary','Artifact','Heirloom']
	$scope.selectedQuality = '';
	$scope.realms=[]
	$scope.auctionResults = auctionService.auctionResults
	$scope.loading=false
	$scope.filters=auctionService.filters 
	$scope.newfilter={}
	$scope.validComparators = null
	$scope.qualities={values:[]}
	// $scope.hoverIndex=''

	$scope.updatePages=function(){
		$scope.backPages = []
		$scope.nextPages = []
		$scope.low = auctionService.resultLow
		$scope.high = auctionService.resultHigh
		for(var i = auctionService.currentPage-5;i<auctionService.currentPage;i++){
			if(i>0){
				$scope.backPages.push(i)
			}
		}
		for(var i=auctionService.currentPage+1;i<=auctionService.currentPage+5;i++){
			if(i<=auctionService.resultPages){
				$scope.nextPages.push(i)
			}
		}
		$scope.currentPage=auctionService.currentPage
	}
	$scope.updatePage = function(page){
		auctionService.updatePage(page)
		$scope.search()
	}
	$scope.firstPage = function(){
		auctionService.firstPage()
		$scope.search()
	}
	$scope.nextPage = function(){
		auctionService.nextPage()
		$scope.search()
	}
	$scope.backPage = function(){
		auctionService.backPage()
		$scope.search()
	}
	$scope.lastPage = function(){
		auctionService.lastPage()
		$scope.search()
	}
	$scope.setSortBy=function(sort){
		// console.log(sort)
		auctionService.setSortBy(sort)
		$scope.search()
	}

	//auction filter functions
	$scope.updateFilter = function(){
		if($scope.validFilters[$scope.newfilter.type].type==='Number'){
			$scope.validComparators = ['>', '=', '<']
			$scope.showFilterValue=true
		}else if($scope.validFilters[$scope.newfilter.type].type==='Boolean'){
			$scope.validComparators = ['True', 'False']
			$scope.showFilterValue=false
		}
	}
	$scope.addFilter = function(){
		// alert('asdf')
		var type = $scope.validFilters[$scope.newfilter.type].name
		var comparator = $scope.newfilter.comparator
		var value = $scope.newfilter.value
		auctionService.filters.push({type:type,comparator:comparator,value:value})
		$scope.newfilter={}
		$scope.showFilterValue=false
		$scope.validComparators=null
		$scope.search()
		// $scope.filters = auctionService.filters

		// console.log($scope.filters)
	}
	$scope.removeFilter = function(index){
		auctionService.filters.splice(index,1)
		$scope.search()
	}
	var auctionUpdate = function(success){
		$scope.loading = false
		$scope.auctionResults = auctionService.auctionResults
		$scope.updatePages()
	}
	// $scope.selectRealm
	$scope.search=function(e){
		if(e){
			e.preventDefault()
		}
		$scope.loading=true

		auctionService.qualities=$scope.qualities.values.map(function(a, b){
			if(a)
				return b.toString()
			return null
		}).filter(function(a){return a})
		auctionService.filters=$scope.filters
		auctionService.setSearchTerm($scope.searchTerm)
		auctionService.setRealm($scope.realmInput)
		auctionService.search(auctionUpdate)
	}
	if($scope.realmInput){
		$scope.search()
	}
}])