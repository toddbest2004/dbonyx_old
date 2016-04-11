angular.module('dbonyx')
.controller('searchBarCtrl', ['$scope', 'searchBar',function($scope,searchBar){
	$scope.search = function(){
		searchBar.search($scope.searchTerm, function(err, data){
			if(err){
				$scope.results=[]
				return
			}
			$scope.results=data
		})
	}
	$scope.clear=function(){
		$scope.searchTerm = ''
		$scope.results=[]
	}
	$scope.hide=function(){
		setTimeout(function(){$scope.results=[];$scope.$apply()},0)
	}
	$scope.clear()
}])
.factory('searchBar', ['$http',function($http){
	var searchBar = {}
	searchBar.results = {}

	searchBar.search = function(term, cb){
		if(term.length<3){
			return cb(false, [])
		}
		var request={url:"/api/item/search/"+term}
		$http(request).then(function success(response){
			cb(false, response.data)
		}, function error(response){
			cb(response.data.error)
		})
	}

	return searchBar
}])