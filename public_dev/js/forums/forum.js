"use strict";
angular.module('dbonyx')
.controller('forumCtrl', ['$scope', 'forumService', function($scope, forumService){
	forumService.getCategories(function(err, data){
		if(err){
			$scope.error = err;
		}else{
			$scope.categories = data;
		}
	});
}])
.controller('forumCatCtrl', ['$sce', '$scope', '$routeParams', '$route', 'forumService', 'onyxUser', function($sce, $scope, $routeParams, $route, forumService, onyxUser){
	$scope.categoryId = $routeParams.categoryId;
	$scope.user = onyxUser;
	forumService.getCategory($scope.categoryId, function(err, data){
		if(err){
			$scope.error = err;
		}else{
			$scope.category = data;
			$scope.category.threads.forEach(function(thread){
				thread.lastMessage=new Date(thread.posts[thread.posts.length-1].createdOn).toLocaleString();
			});
		}
	});
	$scope.newThread = function(){
		$scope.error = false;
		forumService.newThread($scope.categoryId, $scope.title, $scope.message, function(err, result) {
			if(err) {
				$scope.error = err;
			}
			if(result) {
				$route.reload();
			}
		});
	};
	$scope.previewThread = function(){
		$scope.error = false;
		forumService.previewPost($scope.message, function(err, preview) {
			$scope.preview = $sce.trustAsHtml(preview);
		});
	};
}])
.controller('forumThreadCtrl', ['$sce' ,'$scope', '$routeParams', '$route', 'forumService', 'onyxUser', function($sce, $scope, $routeParams, $route,forumService, onyxUser){
	$scope.threadId = $routeParams.threadId;
	$scope.user = onyxUser;
	forumService.getThread($scope.threadId, function(err, data) {
		if(err){
			$scope.error = err;
		}else{
			$scope.thread = data;
			$scope.thread.posts.forEach(function(post) {
				post.compiled = $sce.trustAsHtml(post.parsedContent);
			});
		}
	});
	$scope.postMessage = function(){
		$scope.error = false
		forumService.postMessage($scope.threadId, $scope.message, function(err, result){
			if(err)
				$scope.error = err
			if(result)
				$route.reload()
		})
	}
	$scope.editOn = function(index){
		var post = $scope.thread.posts[index];
		post.editText = post.message;
		post.editing=true;
	};
	$scope.editOff = function(index){
		$scope.thread.posts[index].editing=false;
	};
	$scope.submitEdit = function(index){
		var post = $scope.thread.posts[index];
		forumService.editPost(post._id, post.editText, function(err, result){
			post.editing = false;
			$route.reload();
		});
	};
	$scope.previewPost = function(evt) {
		evt.preventDefault();
		forumService.previewPost($scope.message, function(err, preview) {
			$scope.preview = $sce.trustAsHtml(preview);
		});
	};
	$scope.previewEdit = function(index) {
		var post = $scope.thread.posts[index];
		forumService.previewPost(post.editText, function(err, preview){
			post.preview = $sce.trustAsHtml(preview);
		});
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
.controller('siteNewsCtrl', ['$sce','$scope','forumService',function($sce, $scope, forumService){
	forumService.getSiteNews(function(err, news){
		if(err||!news){
			$scope.error=err
		}else{
			$scope.news = news
			$scope.news.threads.forEach(function(thread){
				thread.replyCount = thread.posts.length-1
				thread.postDate = new Date(thread.posts[0].createdOn).toDateString()
				thread.compiled = $sce.trustAsHtml(thread.posts[0].parsedContent);
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

	forum.editPost = function(id, text, cb){
		$http({
			url:'/api/forum/post/'+id,
			method: 'POST',
			data: {
				text:text
			}
		}).then(function success(response){
			cb(null, response.data)
		}, function error(response){
			console.log(response.data.error)
			cb(response.data.error)
		})
	}

	forum.previewPost = function(message, cb) {
		console.log(message)
		$http({
			url:'/api/forum/preview',
			method: 'POST',
			data: {
				message:message
			}
		}).then(function success(response) {
			cb(null, response.data.preview)
		}, function error(response) {
			cb(response.data.error)
		})
	}

	return forum
}])