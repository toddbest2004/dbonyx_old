angular.module('dbonyx')
.controller('privateProfileCtrl', ['$scope','onyxUser',function($scope, onyxUser){
	$scope.user = onyxUser
	$scope.loading = true
	onyxUser.getPrivateProfile(function(err, data){
		$scope.loading = false
		$scope.userData = data.user;
		$scope.forumPosts = data.posts;
		$scope.error = err
	})
}])
.controller('publicProfileCtrl', ['$scope','$routeParams','onyxUser',function($scope, $routeParams,onyxUser){
	$scope.user = onyxUser
	$scope.loading = true
	onyxUser.getPublicProfile($routeParams.username,function(err, data){
		$scope.loading = false
		$scope.profileData = data
		$scope.error = err
	})
}])