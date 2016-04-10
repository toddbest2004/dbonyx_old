angular.module('UserCtrls', [])
.factory('onyxUser', ['$http',function($http){
	var user = {loggedin:false}
	
	user.checkLoggedInStatus = function(){
		$http({
			method: 'POST',
			url: '/api/user/getUser'
		}).then(function success(response){
			user.username=response.data.username
			user.loggedin=true
		},function error(response){
		})
	}

	//validates user's email (by clicking link created and sent to email)
	user.validateUser = function(username, validateString, cb){
		$http({
			method: 'POST',
			url: '/api/user/validate',
			data: {username:username,validateString:validateString}
		}).then(function success(response){
			console.log("Success!")
			return response
		},function error(response){
			return cb("There was an error validating your email.")
		})
	}

	user.login=function(email, password, cb){
		console.log('a');
		$http({
			method: 'POST',
			url: '/api/user/login',
			data: {email:email,password:password}
		}).then(function success(response){
			// console.log($scope.user)
			user.username=response.data.username
			user.email=response.data.email
			user.loggedin=true
			cb(null, true)
		},function error(response){
			cb(response.data.error, false)
		})
	}

	user.logout=function(){
		$http({
			method: 'POST',
			url: '/api/user/logout'
		}).then(function success(response){
			user.username=''
			user.email=''
			user.loggedin=false
		},function error(response){
			//TODO: handle logout error
		})
	}

	user.register=function(username, email, password1, password2, callback){
		$http({
			method: 'POST',
			url: '/api/user/register',
			data: {username:username,email:email,password1:password1,password2:password2}
		}).then(function success(response){
			user.username=''
			user.email=''
			user.loggedin=false
			return callback(true)
		},function error(response){
			return callback(null, response.data.error)
		})
	}
	
	user.checkLoggedInStatus()
	return user 
}])
.controller('validateCtrl', ['$http','$location','$scope', '$routeParams', 'onyxUser', function($http,$location,$scope,$routeParams, onyxUser){
	//validates user's email (by clicking link created and sent to email)
	onyxUser.validateUser($routeParams.user, $routeParams.validateString, function(response){$scope.error=response})
}])
.controller('userCtrl', ['onyxUser','$scope','$http','$location',function(onyxUser,$scope,$http,$location){
	$scope.user=onyxUser
	$scope.showRegisterForm=false
	$scope.showUserPanel=false
	$scope.showRegisterForm=false
	$scope.toggleRegister=function(){
		$scope.showRegisterForm=!$scope.showRegisterForm
	}
	$scope.login = function(){
		onyxUser.login($scope.login.email, $scope.login.password, function(err, success){
			if(err){
				$scope.error=err
			}
			$scope.showRegisterForm=false
		})
	}
	$scope.logout=function(){
		onyxUser.logout()
		$scope.showUserPanel=false
	}
	$scope.toggleUserPanel = function(){
		$scope.showUserPanel = !$scope.showUserPanel
	}
	$scope.register=function(){
		onyxUser.register($scope.username, $scope.email, $scope.password1, $scope.password2, function(success, err){
			if(success){
				$scope.success="Registered Successfully!"
				$scope.toggleRegister()
			}else{
				if(err)
					$scope.registerError=err
			}
		})
	}
	$scope.clearError = function(){
		$scope.error=false
		$scope.registerError=false
		$scope.success=false
	}
}])
.directive('userRegisterForm', [function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/userRegisterForm.html' 
	}
}])
.directive('userPanel', [function(){
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/userPanel.html' 
	}
}])