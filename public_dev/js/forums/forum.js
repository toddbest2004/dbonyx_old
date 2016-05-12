angular.module('dbonyx')
.controller('forumCtrl', ['$scope', 'forumService', function($scope, forumService){
	forumService.getCategories(function(err, data){
		if(err){
			$scope.error = err
		}else{
			$scope.categories=data
		}
	})

}])
.controller('forumCatCtrl', ['$scope', '$routeParams', '$route', 'forumService', 'onyxUser', function($scope, $routeParams, $route, forumService, onyxUser){
	$scope.categoryId = $routeParams.categoryId
	$scope.user = onyxUser
	forumService.getCategory($scope.categoryId, function(err, data){
		if(err){
			$scope.error = err
		}else{
			$scope.category=data
			$scope.category.threads.forEach(function(thread){
				thread.lastMessage=new Date(thread.posts[thread.posts.length-1].createdOn).toLocaleString()
			})
		}
	})
	$scope.newThread = function(){
		$scope.error = false
		forumService.newThread($scope.categoryId, $scope.title, $scope.message, function(err, result){
			if(err)
				$scope.error = err
			if(result)
				$route.reload()
		})
	}
}])
.controller('forumThreadCtrl', ['$scope', '$routeParams', '$route', 'forumService', 'onyxUser', function($scope, $routeParams, $route,forumService, onyxUser){
	$scope.threadId = $routeParams.threadId
	$scope.user = onyxUser
	forumService.getThread($scope.threadId, function(err, data){
		if(err){
			$scope.error = err
		}else{
			$scope.thread=data
		}
	})
	$scope.postMessage = function(){
		$scope.error = false
		forumService.postMessage($scope.threadId, $scope.message, function(err, result){
			if(err)
				$scope.error = err
			if(result)
				$route.reload()
		})
	}
}])
.controller('forumAdminCtrl', ['$scope', '$location', '$route', 'onyxUser', 'forumService',function($scope, $location, $route, onyxUser, forumService){
	onyxUser.getPrivateProfile(function(err, user){
		if(err||!user||user.userLevel!==1){
			$location.path('/forums')
		}
		$scope.user = user
	})
	forumService.getCategories(function(err, cats){
		if(err||!cats){
			$scope.categories=false
		}else{
			$scope.categories = cats
		}
	})
	$scope.subCategory = []
	$scope.topCategory = {name:''}
	$scope.createTopCategory=function(){
		var name = $scope.topCategory.name
		forumService.createTopCategory(name, function(err, result){
			if(err){
				$scope.error = err
				return
			}
			$route.reload()
		})
	}
	$scope.createSubCategory=function(id, index){
		var name = $scope.subCategory[index]||''
		forumService.createSubCategory(name, id, function(err, result){
			if(err){
				$scope.error = err
				return
			}
			$route.reload()
		})
	}
}])
.controller('siteNewsCtrl', ['$scope','forumService',function($scope, forumService){
	forumService.getSiteNews(function(err, news){
		if(err||!news){
			$scope.error=err
		}else{
			$scope.news = news
			$scope.news.threads.forEach(function(thread){
				thread.replyCount = thread.posts.length-1
			})
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
			cb(response.data.error)
		})
	}

	forum.getCategory = function(categoryId, cb){
		$http({
			url: '/api/forum/category/'+categoryId
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data.error)
		})
	}

	forum.getThread = function(threadId, cb){
		$http({
			url: '/api/forum/thread/'+threadId
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data.error)
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
			cb(response.data.error)
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
			cb(response.data.error)
		})
	}

	forum.createTopCategory = function(name, cb){
		$http({
			method: 'POST',
			url: '/api/forum/category/',
			data: {
				name: name
			}
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data.error)
		})
	}

	forum.createSubCategory = function(name, categoryId, cb){
		$http({
			method: 'POST',
			url: '/api/forum/subcategory/',
			data: {
				name: name,
				id: categoryId
			}
		}).then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data.error)
		})
	}

	forum.getSiteNews = function(cb){
		$http({url:'/api/forum/sitenews/'})
		.then(function success(response){
			cb(null, response.data)
		},function error(response){
			cb(response.data.error)
		})
	}

	return forum
}])