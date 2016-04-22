angular.module('dbonyx')
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