'use strict';

angular.module('dbonyx')
.controller('characterCtrl', ['onyxPersistence', 'onyxCharacter', '$scope', '$http', '$location', function(onyxPersistence, onyxCharacter, $scope, $http, $location) {
	$scope.character=onyxCharacter;

	$scope.search = function(e){
		$scope.error = false;
		if (e) {
			e.preventDefault();
		}
		var name = $scope.characterName;
		var realm = $scope.realmInput;

		if(!name||!realm){
			$scope.error = "Missing one or more required fields.";
			return;
		}

		$scope.character.search(name, realm, function(result) {
			if(result){
				if(result.count===1){
					var name = result.character.name,
						realm = result.character.realm,
						region = result.character.region;
					$location.url('/c/'+name+'/'+realm+'-'+region+'/');
				}else{
					$scope.results=result;
				}
			}else{
				//TODO: handle character not found
				$scope.error="Unable to find character.";
			}
		});
	};

	$scope.selectCharacter = function(index){
		var name = $scope.results[index].name,
			realm = $scope.results[index].realm,
			region = $scope.results[index].region.toUpperCase();
		onyxCharacter.setCharacter($scope.results[index]);
		// onyxPersistence.set("characterName",name);
		// onyxPersistence.set("characterRealm",realm);
		// onyxPersistence.set("characterRegion",region);
		$location.url('/c/'+name+'/'+realm+'-'+region+'/');
	};

	// $scope.realmInput=onyxPersistence.get('characterRealm')+'-'+onyxPersistence.get('characterRegion');
	// $scope.characterName=onyxPersistence.get('characterName');
	
	// $scope.test=$routeParams.characterName
	
}])
.controller('characterMain', ['onyxCharacter', '$routeParams', '$scope', function(onyxCharacter, $routeParams, $scope) {
	var name = $routeParams.name,
		realm = $routeParams.server;
	if (!onyxCharacter.name||onyxCharacter.name!=$routeParams.name) {
		onyxCharacter.search(name, realm, function() {
			console.log("loaded");
		});
	}
			$scope.character=onyxCharacter;
	$scope.character.get('items');
	$scope.character.get('mounts');
	$scope.character.get('achievements');
	$scope.character.get('reputation');
}])
.controller('characterProfessions', ['onyxCharacter', '$scope', function(onyxCharacter, $scope){
	$scope.character = onyxCharacter;
	$scope.character.get('professions');
	$scope.expandRecipes = [false,false,false,false,false,false];
	$scope.expandToggle = function(index){
		// console.log(index)
		$scope.expandRecipes[index] = !$scope.expandRecipes[index];
	};
}]);