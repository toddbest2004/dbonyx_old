angular.module('dbonyx')
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