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
	$scope.realmInput=onyxPersistence.getRealm()
	$scope.characterName=onyxPersistence.getCharacterName()

	$scope.search=function(e){
		e.preventDefault()
		$scope.loading=true
		$http({
			method: 'GET',
			url: '/api/character/load',
			params: {realm:$scope.realmInput,name:$scope.characterName}
		}).then(function success(response){
			onyxPersistence.setCharacterName($scope.characterName)
			onyxPersistence.setCharacterRealm($scope.realmInput)
			$scope.loading=false
			$location.path('/character/main').replace()
		}, function error(response){
			onyxPersistence.setCharacterName('')
			$scope.loading=false
			//Handle Character not found, unable to connect, etc.
		})
	}
}])