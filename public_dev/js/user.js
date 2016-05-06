angular.module('UserCtrls', [])
.factory('onyxUser', ['$http', 'Auth', function($http, Auth){
	var user = {loggedin:false}
	
	user.checkLoggedInStatus = function(){
		user.loggedin=Auth.isLoggedIn()
		if(user.loggedin){
			$http({
				method: 'POST',
				url: '/api/user/getUser'
			}).then(function success(response){
				user.username=response.data.username
				user.loggedin=true
			},function error(response){
			})
		}
	}

	//validates user's email (by clicking link created and sent to email)
	user.validateUser = function(username, validateString, cb){
		$http({
			method: 'POST',
			url: '/api/user/validate',
			data: {username:username,validateString:validateString}
		}).then(function success(response){
			return response
		},function error(response){
			return cb("There was an error validating your email.")
		})
	}

	user.login=function(email, password, cb){
		$http({
			method: 'POST',
			url: '/api/user/login',
			data: {email:email,password:password}
		}).then(function success(response){
			Auth.saveToken(response.data.token);
			user.username=response.data.username
			user.email=response.data.email
			user.loggedin=true
			cb(null, true)
		},function error(response){
			cb(response.data.error, false)
		})
	}

	user.logout=function(){
		Auth.removeToken();
		user.loggedin = false;
		user.username = null;
		user.email = null;
	}

	user.register=function(username, email, password1, password2, callback){
		$http({
			method: 'POST',
			url: '/api/user/register',
			data: {username:username,email:email,password1:password1,password2:password2}
		}).then(function success(response){
			user.login(email, password1, function(err, success){
				callback(true)
			})
		},function error(response){
			return callback(null, response.data.error)
		})
	}
	
	user.getPublicProfile = function(username, callback){
		$http({
			url: '/api/user/publicProfile',
			params: {username:username}
		}).then(function success(response){
			return callback(null, response.data)
		}, function error(response){
			return callback(response.data.error)
		})
	}

	user.getPrivateProfile = function(callback){
		$http({
			url: '/api/user/privateProfile'
		}).then(function success(response){
			return callback(null, response.data)
		}, function error(response){
			return callback(response.data.error)
		})
	}

	user.checkLoggedInStatus()
	return user 
}])
.factory("Auth", ["$window", function($window){
	return {
		saveToken: function(token){
			$window.localStorage["onyx-token"] = token;
		},
		getToken: function(){
			return $window.localStorage["onyx-token"];
		},
		removeToken: function(){
			return $window.localStorage.removeItem('onyx-token')
		},
		isLoggedIn: function(){
			var token = this.getToken();
			return token ? true : false
		}
	};
}])
.factory("AuthInterceptor", ["Auth", function(Auth){
	return {
		request: function(config){
			var token = Auth.getToken();
			if (token) {
				config.headers.Authorization = 'JWT ' + token;
			}
			return config;
		}
	};
}])
.controller('validateCtrl', ['$http','$location','$scope', '$routeParams', 'onyxUser', function($http,$location,$scope,$routeParams, onyxUser){
	//validates user's email (by clicking link created and sent to email)
	onyxUser.validateUser($routeParams.user, $routeParams.validateString, function(response){$scope.error=response})
}])
.controller('userCtrl', ['onyxUser','$scope','$http','$location', function(onyxUser,$scope,$http,$location){
	$scope.user=onyxUser
	$scope.showRegisterForm=false
	$scope.showUserPanel=false
	$scope.showRegisterForm=false
	$scope.toggleRegister=function(){
		$scope.showRegisterForm=!$scope.showRegisterForm
	}
	$scope.login = function(){
		onyxUser.login($scope.login.email, $scope.login.password, function(err, success){
			$scope.login.email=null
			$scope.login.password=null
			if(err){
				$scope.error=err
			}
			$scope.showRegisterForm=false
		})
	}
	$scope.logout=function(){
		onyxUser.logout()
		$scope.user = onyxUser;
		$scope.showUserPanel=false
	}
	$scope.toggleUserPanel = function(){
		$scope.showUserPanel = !$scope.showUserPanel
	}
	$scope.signinActive = function(){
		$scope.signin=true
		document.getElementById('email').focus();
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
