angular.module('dbonyx')
.controller('privateProfileCtrl', ['$scope','onyxUser',function($scope, onyxUser){
	$scope.user = onyxUser
	$scope.loading = true
	onyxUser.getPrivateProfile(function(err, data){
		$scope.loading = false
		$scope.profileData = data
		$scope.error = err
	})
}])
.controller('publicProfileCtrl', ['$scope','onyxUser',function($scope, onyxUser){
	$scope.user = onyxUser
}])