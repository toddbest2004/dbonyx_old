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
	return persistence
})
.factory('onyxUser', function($http){
	var user = {}

	return user
})
.controller('characterCtrl', ['onyxPersistence', '$scope', '$http', '$location', '$routeParams', function(onyxPersistence, $scope, $http, $location, $routeParams) {
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
				onyxPersistence.setCharacterName($scope.characterName)
				$location.path('/character/main').replace()
			}else{
				//show all characters for choosing
				$scope.results=response.data.characters
				console.log(response.data)
			}
		}, function error(response){
			onyxPersistence.setCharacterName('')
			$scope.loading=false
			console.log("Unable to find character.")
			//Handle Character not found, unable to connect, etc.
		})
	}
	$scope.selectCharacter = function(index){
		console.log(index)
		onyxPersistence.setCharacterName($scope.results[index].name)
		onyxPersistence.setRealm($scope.results[index].realm+"-"+$scope.results[index].region.toUpperCase())
		$location.path('/character/main').replace()
	}
	$scope.realmInput=onyxPersistence.getRealm()
	$scope.characterName=onyxPersistence.getCharacterName()
	if($routeParams.characterName){
		onyxPersistence.setCharacterName($routeParams.characterName)
		$scope.characterName=onyxPersistence.getCharacterName()
		$scope.search()
	}
	
	// $scope.test=$routeParams.characterName
	
}])