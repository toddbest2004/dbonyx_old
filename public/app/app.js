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
	persistence.setCharacterName=function(characterName){
		_characterName=characterName
		$cookies.put('characterName',characterName)
	}
	persistence.getCharacterName=function(){
		return _characterName||$cookies.get('characterName')||''
	}
	persistence.setCharacterRealm=function(characterRealm){
		_characterRealm=characterRealm
		$cookies.put('characterRealm',characterRealm)
	}
	persistence.getCharacterRealm=function(){
		return _characterRealm||$cookies.get('characterRealm')||''
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
	$scope.character.getEquipment()
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
	}

	character.getEquipment = function(){
		if(!character.items){
			var params = {
				name:character.name,
				realm:character.realm,
				region:character.region
			}
			$http({
				method: 'GET',
				url: '/api/character/equipment',
				params: params
			}).then(function success(response){
				character.items = response.data.items
			}, function error(response){

			})
		}
	}

	return character
})