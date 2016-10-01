"use strict";
angular.module('dbonyx')
.factory('onyxCharacter', ['$http', function($http) {
	var character = {},
		getOnLoad =[],
		validKeys = {items:true, mounts:true, achievements:true, reputation:true, professions:true, battlepets:true};
	
	character.loaded=false;


	character.setCharacter = function(data) {
		for(var key in data){
			character[key]=data[key];
		}
	};

	character.runOnLoad = function(){
		for(var i=0;i<getOnLoad.length;i++) {
			character.get(getOnLoad[i]);
		}
	};

	character.search=function(name, realmInput, callback){
		// console.log("searching", name, realmInput);
		if(!name){
			character.loading=false;
			callback(false);
			return;
		}
		if(!realmInput){
			return;
		}

		var params = {name:name, realm:realmInput};
		var realmSplit = realmInput.split("-");
		if(character.name === name && character.realm === realmSplit[0] && character.region === realmSplit[1]) {
			//asked to load current character, short circuit.
			if(callback) {
				callback(character);
			}
			return;
		}
		//TODO: clear character

		character.realm = realmSplit[0];
		character.region = realmSplit[1];
		character.name = name;
		character.loading = true;
		character.loaded = false;

		$http({
			method: 'GET',
			url: '/api/character/search',
			params: params
		}).then(function success(response){
			if (response.data.count === 1) {
				character.setCharacter(response.data.character);
				character.loading = false;
				character.loaded = true;
				character.runOnLoad();
				if (callback) {
					callback(character);
				}
			} else {
				//show all characters for choosing
				character.loading = false;
				if(callback) {
					callback(response.data.characters);
				}
			}
		}, function error(response){
			character.loading = false;
			character.loaded = false;
			if(callback) {
				callback(false);
			}
			//Handle Character not found, unable to connect, etc.
		});
	};

	character.get = function(key){
		if(!validKeys[key]){
			//handle invalid key
			return;
		}
		if(!character.loaded){
			//set key to be loaded once the character is full implemented
			getOnLoad.push(key);
			return;
		}
		// if(!character[key]){
			if(!character.name||!character.realm||!character.region){
				return;
			}
			var params = {name:character.name, realm:character.realm, region:character.region};
			$http({
				method: 'GET',
				url: '/api/character/'+key,
				params: params
			}).then(function success(response){
				console.log(key);
				character[key]=response.data[key];
				if(key==="professions"){
					console.log(response.data)
				}
			},function error(response){
				console.log(response);
				//todo: error handling
			});
		// }
	};

	return character;
}]);