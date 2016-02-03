var app = angular.module('dbonyx', ['AuctionCtrls', 'ItemCtrls','ngRoute','ngCookies'])
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
.when('/items/:id', {
	templateUrl: 'app/views/item.html'
})
.otherwise({
	templateUrl: 'app/views/404.html'
})

$locationProvider.html5Mode(true)
}])
.factory('onyxPersistence', function($cookies){
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
})
.factory('onyxUser', function($http){
	var user = {}

	return user
})
.controller('characterCtrl', ['onyxPersistence', 'onyxCharacter', '$scope', '$http', '$location', '$routeParams', function(onyxPersistence, onyxCharacter, $scope, $http, $location, $routeParams) {
	$scope.character=onyxCharacter
	$scope.search=function(e){
		if(e){
			e.preventDefault()
		}
		$scope.loading=true
		var params = {name:$scope.characterName}
		if($routeParams.characterName){

		}else if($scope.realmInput){
			params.realm=$scope.realmInput
		}
		$http({
			method: 'GET',
			url: '/api/character/load',
			params: params
		}).then(function success(response){
			$scope.loading=false
			if(response.data.count===1){
				onyxPersistence.set('characterName',$scope.characterName)
				onyxPersistence.set("characterRealm",response.data.character.realm)
				onyxPersistence.set("characterRegion",response.data.character.region)
				$scope.character.setCharacter(response.data.character)
				$location.url('/character/main')
			}else{
				//show all characters for choosing
				$scope.results=response.data.characters
			}
		}, function error(response){
			onyxPersistence.set('characterName','')
			$scope.loading=false
			$scope.error="Unable to find character."
			//Handle Character not found, unable to connect, etc.
		})
	}
	$scope.selectCharacter = function(index){
		console.log(index)
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
	$scope.character.get('reputation')
	$scope.character.get('mounts')
	$scope.character.get('achievements')
}])
.factory('onyxCharacter', function($http){
	var character = {}
	var _characterData

	character.setCharacter = function(data){
		character.name = data.name
		character.realm = data.realm
		character.region = data.region
		character.level = data.level
		character.faction = data.faction
		character.thumbnail = data.thumbnail
		character.guildName = data.guildName
	}

	// character.getEquipment = function(){
	// 	if(!character.items){
	// 		var params = {
	// 			name:character.name,
	// 			realm:character.realm,
	// 			region:character.region
	// 		}
	// 		$http({
	// 			method: 'GET',
	// 			url: '/api/character/equipment',
	// 			params: params
	// 		}).then(function success(response){
	// 			character.items = response.data.items
	// 		}, function error(response){

	// 		})
	// 	}
	// }

	character.get = function(key){
		if(!character[key]){
			var params = {
				name:character.name,
				realm:character.realm,
				region:character.region
			}
			$http({
				method: 'GET',
				url: '/api/character/'+key,
				params: params
			}).then(function success(response){
				character[key] = response.data[key]
			}, function error(response){

			})
		}
	}

	return character
})