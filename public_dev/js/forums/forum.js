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
	$scope.categoryId = $routeParams.categoryId
	forumService.getCategory($scope.categoryId, function(err, data){
		if(err){

		}else{
			$scope.category=data
		}
	})
	$scope.newThread = function(){
		forumService.newThread($scope.categoryId, $scope.title, $scope.message, function(err, result){
			console.log(err)
			console.log(result)
		})
	}
}])
.controller('forumThreadCtrl', ['$scope', '$routeParams', 'forumService', function($scope, $routeParams, forumService){
	$scope.threadId = $routeParams.threadId
	forumService.getThread($scope.threadId, function(err, data){
		if(err){

		}else{
			$scope.thread=data
		}
	})
	$scope.postMessage = function(){
		forumService.postMessage($scope.threadId, $scope.message, function(err, result){
			console.log(err)
			console.log(result)
		})
	}
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

	forum.newThread = function(categoryId, title, message, cb){
		$http({
			method: 'POST',
			url: '/api/forum/category/'+categoryId,
			data: {
				title: title,
				message: message
			}
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data)
		})
	}

	forum.postMessage = function(threadId, message, cb){
		$http({
			method: 'POST',
			url: '/api/forum/thread/'+threadId,
			data: {
				message: message
			}
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data)
		})
	}

	return forum
}])