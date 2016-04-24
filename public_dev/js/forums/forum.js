angular.module('dbonyx')
.controller('forumCtrl', ['$scope', 'forumService', function($scope, forumService){
	forumService.getCategories(function(err, data){
		if(err){

		}else{
			$scope.categories=data
		}
	})

}])
.controller('forumCatCtrl', ['$scope', '$routeParams', 'forumService', function($scope, $routeParams, forumService){
	forumService.getCategory($routeParams.categoryId, function(err, data){
		if(err){

		}else{
			$scope.category=data
		}
	})
}])
.controller('forumThreadCtrl', ['$scope', '$routeParams', 'forumService', function($scope, $routeParams, forumService){
	forumService.getThread($routeParams.threadId, function(err, data){
		if(err){

		}else{
			$scope.thread=data
		}
	})
}])
.factory('forumService', ['$http', 'Auth',function($http, Auth){
	var forum = {}

	forum.getCategories = function(cb){
		$http({
			url: '/api/forum/categories'
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data)
		})
	}

	forum.getCategory = function(categoryId, cb){
		$http({
			url: '/api/forum/category/'+categoryId
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data)
		})
	}

	forum.getThread = function(threadId, cb){
		$http({
			url: '/api/forum/thread/'+threadId
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data)
		})
	}

	return forum
}])