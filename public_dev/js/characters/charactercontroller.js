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

		$scope.character.search(name, realm, function(character) {
			if(character){
				var name = character.name,
					realm = character.realm,
					region = character.region;
				$location.url('/c/'+name+'/'+realm+'-'+region+'/');
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
		$location.url('/c/'+name+'/'+realm+'-'+region+'/');
	};

	// $scope.realmInput=onyxPersistence.get('characterRealm')+'-'+onyxPersistence.get('characterRegion');
	// $scope.characterName=onyxPersistence.get('characterName');
	
	// $scope.test=$routeParams.characterName
	
}])
.controller('characterMain', ['onyxCharacter', '$routeParams', '$scope', function(onyxCharacter, $routeParams, $scope) {
	var name = $routeParams.name,
		realm = $routeParams.server;
	
	$scope.character=onyxCharacter;
	$scope.character.search(name, realm);
	// $scope.character.get('items');
	// $scope.character.get('mounts');
	// $scope.character.get('achievements');
	// $scope.character.get('reputation');
	// $scope.character.get('battlepets');
}])
.controller('characterAchievementCtrl', ['onyxCharacter', 'achievementService', '$routeParams', '$scope', function(onyxCharacter, achievementService, $routeParams, $scope) {
	var name = $routeParams.name,
		realm = $routeParams.server;

	$scope.activeAchievements = [];
	$scope.selectSubCat = function(cat, sub) {
		$scope.activeAchievements = $scope.categories[cat].categories[sub].achievements;
	};
	$scope.selectCat = function(cat) {
		$scope.activeAchievements = $scope.categories[cat].achievements;
		$scope.categories[cat].expanded = !$scope.categories[cat].expanded;
	};

	$scope.character=onyxCharacter;
	$scope.character.search(name, realm);

	$scope.categories = achievementService.categories;
	achievementService.getCategories(function() {
		$scope.categories = achievementService.categories;
	});

	$scope.achievements = achievementService.achievements;
}])
.controller('characterProfessions', ['onyxCharacter', '$routeParams', '$scope', function(onyxCharacter, $routeParams, $scope){
	var name = $routeParams.name,
		realm = $routeParams.server;
	
	$scope.character=onyxCharacter;
	$scope.character.search(name, realm);
	// $scope.character.get('professions');
	$scope.expandRecipes = [false,false,false,false,false,false];
	$scope.expandToggle = function(index){
		// console.log(index)
		$scope.expandRecipes[index] = !$scope.expandRecipes[index];
	};
}]);