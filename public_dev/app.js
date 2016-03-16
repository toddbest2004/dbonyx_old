var app = angular.module('dbonyx', ['AuctionCtrls', 'ItemCtrls', 'MenuCtrls','ngRoute','ngCookies'])
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
$routeProvider
.when('/', {
	templateUrl: 'app/views/index.html'
}) 
.when('/auctions', {
	templateUrl: 'app/views/auctions.html'
}) 
.when('/database', {
	templateUrl: 'app/views/database.html'
})
.when('/character', {
	templateUrl: 'app/views/character.html'
})
.when('/character/main',{
	templateUrl: 'app/views/characterMain.html'
})
.when('/character/reputation',{
	templateUrl: 'app/views/characterReputation.html'
})
.when('/character/achievements',{
	templateUrl: 'app/views/characterAchievements.html'
})
.when('/character/mounts',{
	templateUrl: 'app/views/characterMounts.html'
})
.when('/character/battlepets',{
	templateUrl: 'app/views/characterBattlepets.html'
})
.when('/character/professions',{
	templateUrl: 'app/views/characterProfessions.html'
})
.when('/character/pvp',{
	templateUrl: 'app/views/characterPvp.html'
})
.when('/character/:characterName', {
	templateUrl: 'app/views/character.html'
})
.when('/item/:id', {
	templateUrl: 'app/views/item.html'
})
.when('/mount/:id', {
	templateUrl: 'app/views/mount.html'
})
.when('/profile', {
	controller: 'userCtrl',
	templateUrl: 'app/views/profile.html'
})
.when('/register', {
	templateUrl: 'app/views/register.html'
})
.when('/validate/:user/:validateString', {
	templateUrl: 'app/views/validate.html'
})
.otherwise({
	templateUrl: 'app/views/404.html'
})

$locationProvider.html5Mode(true)
}])
.factory('onyxPersistence', ['$cookies',function($cookies){
	var persistence = {}
	var _persisted = {}
	var _realm
	var _characterName
	var _characterRealm
	persistence.setRealm=function(realm){
		_realm=realm
		$cookies.put('realm', realm)
	}
	persistence.getRealm=function(){
		return _realm||$cookies.get('realm')||''
	}

	persistence.set=function(key, value){
		_persisted[key]=value
		$cookies.put(key,value)
	}
	persistence.get=function(key){
		return _persisted[key]||$cookies.get(key)||''
	}
	return persistence
}])
.factory('onyxUser', ['$http',function($http){
	var user = {loggedin:false}
	$http({
		method: 'GET',
		url: '/api/user/getUser'
	}).then(function success(response){
		user.username=response.data.username
		user.email=response.data.email
		user.loggedin=true
	},function error(response){
		// console.log(response)
	})

	return user
}])
.controller('validateCtrl', ['$http','$location','$scope', '$routeParams', function($http,$location,$scope,$routeParams){
	//validates user's email (by clicking link created and sent to email)
	$http({
		method: 'POST',
		url: '/api/user/validate',
		data: {username:$routeParams.user,validateString:$routeParams.validateString}
	}).then(function success(response){
		// console.log("Success!")
		$location.url('/')
	},function error(response){
		//TODO:Handle login error
		$scope.error=response.data.error
	})
}])
.controller('userCtrl', ['onyxUser','$scope','$http','$location',function(onyxUser,$scope,$http,$location){
	$scope.user=onyxUser
	$scope.register=false
	$scope.login = {}
	$scope.showUserPanel=false
	$scope.showRegister=function(){
		$scope.register=!$scope.register
		// console.log($scope.register)
	}
	$scope.login=function(){
		// console.log('a')
		$http({
			method: 'POST',
			url: '/api/user/login',
			data: {email:$scope.login.email,password:$scope.login.password}
		}).then(function success(response){
			// console.log($scope.user)
			$scope.user.username=response.data.username
			$scope.user.email=response.data.email
			$scope.user.loggedin=true
		},function error(response){
			//TODO: Hanlde login error
		})
	}
	$scope.register=function(){
		$http({
			method: 'POST',
			url: '/api/user/register',
			data: {username:$scope.username,email:$scope.email,password1:$scope.password1,password2:$scope.password2}
		}).then(function success(response){
			$scope.user.username=''
			$scope.user.email=''
			$scope.user.loggedin=false
			$location.url('/')
		},function error(response){
			//TODO: handle register error
		})
	}
	$scope.logout=function(){
		$http({
			method: 'POST',
			url: '/api/user/logout'
		}).then(function success(response){
			$scope.user.username=''
			$scope.user.email=''
			$scope.user.loggedin=false
			$location.url('/')
		},function error(response){
			//TODO: handle logout error
		})
	}
	$scope.toggleUserPanel = function(){
		$scope.showUserPanel = !$scope.showUserPanel
	}
}])
.controller('characterCtrl', ['onyxPersistence', 'onyxCharacter', '$scope', '$http', '$location', '$routeParams', function(onyxPersistence, onyxCharacter, $scope, $http, $location, $routeParams) {
	$scope.character=onyxCharacter

	$scope.search = function(e){
		if(e){
			e.preventDefault
		}
		var name = $routeParams.characterName||$scope.characterName||''
		var realm = $scope.realmInput || false
		$scope.character.search(name, realm, function(result){
			if(result){
				if(result.count===1){
					$location.url('/character/main')
				}else{
					$scope.results=result
				}
			}else{
				//TODO: handle character not found
				$scope.error="Unable to find character."
			}
		})
	}

	$scope.selectCharacter = function(index){
		onyxCharacter.setCharacter($scope.results[index])
		onyxPersistence.set("characterName",$scope.results[index].name)
		onyxPersistence.set("characterRealm",$scope.results[index].realm)
		onyxPersistence.set("characterRegion",$scope.results[index].region.toUpperCase())
		$window.location.href = '/character/main';
	}

	$scope.realmInput=onyxPersistence.get('characterRealm')+'-'+onyxPersistence.get('characterRegion')
	$scope.characterName=onyxPersistence.get('characterName')
	if($routeParams.characterName){
		onyxPersistence.set('characterName',$routeParams.characterName)
		$scope.characterName=onyxPersistence.get('characterName')
		$scope.search()
	}
	
	// $scope.test=$routeParams.characterName
	
}])
.controller('characterMain', ['onyxPersistence', 'onyxCharacter', '$scope', function(onyxPersistence, onyxCharacter, $scope) {
	$scope.character=onyxCharacter
	$scope.character.get('items')
	$scope.character.get('mounts')
	$scope.character.get('achievements')
	$scope.character.get('reputation')
}])
.controller('characterProfessions', ['onyxCharacter', '$scope', function(onyxCharacter, $scope){
	$scope.character=onyxCharacter
	$scope.character.get('professions')
	$scope.expandRecipes=[false,false,false,false,false,false]
	$scope.expandToggle=function(index){
		// console.log(index)
		$scope.expandRecipes[index]=!$scope.expandRecipes[index]
	}
}])
.controller('mountCtrl', ['$scope','$routeParams', '$http',function($scope, $routeParams, $http){
	$scope.mountId = parseInt($routeParams.id)
	$scope.mount = {}
	$scope.loading=true

	if($scope.mountId){
		$http({
			method: 'GET',
			url: '/api/mount/'+$scope.mountId
		}).then(function success(response){
			// console.log(response)
			$scope.mount=response.data.mount
		},function error(response){
			//TODO: handle error
			// console.log(response)
		})
	}

	// $routeParams.id
}])
.factory('onyxCharacter', ['$http', 'onyxPersistence',function($http, onyxPersistence){
	var character = {}
	var getOnLoad =[]
	character.loaded=false

	character.setCharacter = function(data){
		for(key in data){
			character[key]=data[key]
		}
	}

	character.runOnLoad = function(){
		for(var i=0;i<getOnLoad.length;i++){
			character.get(getOnLoad[i])
		}
	}

	character.search=function(name, realmInput, callback){
		character.loading=true
		if(!name){
			character.loading=false
			callback(false)
			return
		}
		var params = {name:name}
		if(realmInput){
			params.realm=realmInput
		}
		$http({
			method: 'GET',
			url: '/api/character/load',
			params: params
		}).then(function success(response){
			if(response.data.count===1){
				onyxPersistence.set('characterName',name)
				onyxPersistence.set("characterRealm",response.data.character.realm)
				onyxPersistence.set("characterRegion",response.data.character.region)
				character.setCharacter(response.data.character)
				character.loading=false
				character.loaded=true
				character.runOnLoad()
				callback(response.data)
			}else{
				//show all characters for choosing
				character.loading=false
				callback(response.data.characters)
			}
		}, function error(response){
			character.loading=false
			onyxPersistence.set('characterName','')
			callback(false)
			//Handle Character not found, unable to connect, etc.
		})
	}

	character.get = function(key){
		if(!character.loaded){
			//set key to be loaded once the character is full implemented
			getOnLoad.push(key)
			return
		}
		if(!character[key]){
			if(!character.name||!character.realm||!character.region){
				return
			}
			var params = {name:character.name, realm:character.realm, region:character.region}
			$http({
				method: 'GET',
				url: '/api/character/'+key,
				params: params
			}).then(function success(response){
				character[key]=response.data[key]
			},function error(response){
				//todo: error handling
			})
		}
	}

	character.init = function(){
		var characterName = onyxPersistence.get('characterName')
		var characterRealm = onyxPersistence.get('characterRealm')
		var characterRegion = onyxPersistence.get('characterRegion')
		var realmInput = characterRealm+"-"+characterRegion
		if(typeof(characterName)==='string'&&characterName!==''){
			character.search(characterName, realmInput, function(result){})
		}
	}

	character.init()
	return character
}])
.controller('watchlistCtrl', ['$scope','$http',function($scope, $http){
	var getWatchlists = function(){
		$http({
			method: 'GET',
			url: '/api/watchlist/'
		}).then(function success(response){
			$scope.watchlists=response.data.watchlists
		},function error(response){
			//todo: error handling
		})
	}
	getWatchlists()
	$scope.watchlists=[]
	
}])
.directive('sidebar', [function(){
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		templateUrl: 'app/templates/sidebar.html'
	}
}])
.directive('mainContent', [function(){
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		templateUrl: 'app/templates/mainContent.html'
	}
}])