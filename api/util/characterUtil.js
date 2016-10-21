'use strict';
var request = require("request");
var mysql = require("../../mysql");

var raw = require("mysql");
var rawConnection = raw.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});

var fs = require("fs");
var realmUtil = require("../util/realmUtil");

var characterUtil = {};

characterUtil.getCharacter = function(name, realmString, callback) {
	if(!name||!realmString) {
		callback("Missing one or more required fields");
		return;
	}
	name = name.toLowerCase();
	var slugId = realmUtil.realmStringToSlug(realmString),
		realmSplit = realmUtil.realmSplit(realmString);

	mysql.Character.where({name:name, slug_id:slugId}).fetch().then(function(character) {
		if (!character) {
			createCharacter(name, realmSplit, callback);
			return;
		}
		var oneDay = 1000*60*60*24;
		character = character.toJSON();
		if(Date.now() - character.lastChecked > oneDay) {
			console.log("Character exists. Updating with fresh data.");
			updateCharacter(name, character.id, realmSplit, callback);
			return;
		}
		//Character exists and is up to date
		console.log("character up to date");
		callback(false, character);
	}).catch(function() {
		callback("There was an error finding character in our database.");
		return;
	});
};

var getCharacterFromServer = function(name, realmSplit, callback) {
	console.log("Importing character");
	var realm = realmSplit.realm;
	var region = realmSplit.region;
	var url = "https://"+region+".api.battle.net/wow/character/"+realm+"/"+name+"?fields=achievements,appearance,feed,guild,hunterPets,items,mounts,pets,petSlots,progression,professions,pvp,quests,reputation,stats,talents,titles,audit&locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if (!error && response.statusCode===200) {
			callback(false, body);
		} else {
			console.log("Character doesn't seem to exist.");
			callback("Character doesn't seem to exist.");
		}
	});
};

function updateCharacter (name, id, realmSplit, callback) {
	getCharacterFromServer(name, realmSplit, function(err, body) {
		if(err) {
			callback(err);
			return;
		}
		var slugId = realmUtil.realmStringToSlug(realmSplit.realm+"-"+realmSplit.region);
		body.lastChecked = Date.now();
		body.nameSlug = name;

		mysql.Character.forge({id:id, name:body.name, slug_id:slugId}).save({
			lastModified:new Date(body.lastModified),
			lastChecked:new Date()
		}, {method:"update"}).then(function(newCharacter) {
			updateCharacterDetails(newCharacter, body, callback);
		}).catch(function(err) {
			console.log(err);
			callback("There was an error updating character");
			return;
		});
	});
}

function createCharacter (name, realmSplit, callback) {
	getCharacterFromServer(name, realmSplit, function(err, body) {
		if(err) {
			callback(err);
			return;
		}
		var slugId = realmUtil.realmStringToSlug(realmSplit.realm+"-"+realmSplit.region);
		body.lastChecked = Date.now();
		body.nameSlug = name;

		mysql.Character.forge({name:body.name, slug_id:slugId}).save({
			lastModified:new Date(body.lastModified),
			lastChecked:new Date()
		}).then(function(newCharacter) {
			updateCharacterDetails(newCharacter, body, callback);
		}).catch(function(err) {
			console.log(err);
			callback("There was an error updating character");
			return;
		});
	});
}

function updateCharacterDetails(character, body, callback) {
	console.log("updating character");

	//these update functions should run in parallel to increase import speed.
	Promise.all([
		updateCharacterAchievements(character.id, body.achievements),
		updateCharacterMounts(character.id, body.mounts),
		updateCharacterPets(character.id, body.pets),
		updateCharacterQuests(character.id, body.quests),
	]).then(function() {
		mysql.Character.where({id:character.id}).fetch({withRelated:["achievements", "battlepets", "mounts", "quests", "reputation", "titles"]}).then(function(character) {
			console.log(character.toJSON().quests);
			callback("err");
		});
	});
	// body.thumbnail = body.thumbnail.replace("avatar.jpg","");
	// character.lastModified=body.lastModified;
	// character.lastChecked=Date.now();
	// character.name = body.name;
	// character.realm = body.realm;
	// character.class=body.class;
	// character.race=body.race;
	// character.gender=body.gender;
	// character.level=body.level;
	// character.achievementPoints=body.achievementPoints;
	// character.thumbnail=body.thumbnail.replace(new RegExp("/", 'g'),"").replace("thumbnail.jpg","");
	// character.calcClass=body.calcClass;
	// character.faction=body.faction;
	// if(body.guild) {
	// 	character.guildName = body.guild.name;
	// 	character.guildRealm = body.guild.realm;
	// }
	// character.quests=body.quests;
	// character.titles=body.titles;
	// character.mounts=body.mounts.collected.map(function(mount){
	// 	return mount.spellId;
	// });
	// character.criteria=[];
	// for(var i=0; i<body.achievements.criteria.length;i++){
	// 	character.criteria.push({
	// 		id:body.achievements.criteria[i],
	// 		quantity:body.achievements.criteriaQuantity[i],
	// 		timestamp:body.achievements.criteriaTimestamp[i],
	// 		created:body.achievements.criteriaCreated[i]
	// 	});
	// }
	// character.achievements=[];
	// for(var i=0;i<body.achievements.achievementsCompleted.length;i++){
	// 	character.achievements.push({
	// 		id:body.achievements.achievementsCompleted[i],
	// 		timestamp:body.achievements.achievementsCompletedTimestamp[i]
	// 	});
	// }
	
	// character.battlepets = body.pets;
	// character.battlepets.collected.forEach(function(pet) {
	// 	pet.details = pet.stats.speciesId;
	// });

	// character.reputation=body.reputation;
	// character.appearance=body.appearance;
	// character.items=body.items;
	// character.stats=body.stats;
	// character.professions=body.professions;
	// character.progression=body.progression;
	// character.talents=body.talents;
	// character.pvp=body.pvp;
	// console.log("start")
	// character.save(function(err, updatedCharacter){
	// 	console.log("saved?")
	// 	updatedCharacter.populate(characterFullPopulate, function(err){
	// 		importCharacterImages(body.thumbnail, function() {
	// 			callback(false, updatedCharacter);
	// 			processQuestCompletion(updatedCharacter);
	// 		});
	// 	});
	// });
	console.log("end?");
}

function joinTableQuery(query, data) {
	return new Promise(function(resolve, reject) {
		rawConnection.query(query, [data], function(err) {
			if (err) {
				console.log("Error importing character's quests");
				reject();
				return;
			}
			resolve();
		});
	});
}

function updateCharacterAchievements(characterId, achievements) {
	var query = "INSERT IGNORE INTO characters_achievements (character_id, achievement_id, timestamp) VALUES ?";
	var achievementData = [];
	for (var i=0; i < achievements.achievementsCompleted.length; i++) {
		achievementData.push([characterId, achievements.achievementsCompleted[i], new Date(achievements.achievementsCompletedTimestamp[i])]);
	}

	return joinTableQuery(query, achievementData);
}

function updateCharacterMounts(characterId, mounts) {
	var query = "INSERT IGNORE INTO characters_mounts (character_id, mount_id) VALUES ?";
	var mountData = mounts.collected.map(function(mount) {
		return [characterId, mount.creatureId];
	});

	return joinTableQuery(query, mountData);
}

function updateCharacterPets(characterId, pets) {
	var query = "INSERT IGNORE INTO characters_pets (character_id, battlepet_guid, battlepet_id, breed, quality, level, isFirstAbilitySlotSelected, isSecondAbilitySlotSelected, isThirdAbilitySlotSelected) VALUES ?";
	var petData = pets.collected.map(function(pet) {
		return [characterId, pet.battlePetGuid, pet.stats.speciesId, pet.stats.breedId, pet.stats.petQualityId, pet.stats.level, pet.isFirstAbilitySlotSelected, pet.isSecondAbilitySlotSelected, pet.isThirdAbilitySlotSelected];
	});

	return joinTableQuery(query, petData);
}

function updateCharacterQuests(characterId, quests) {
	var query = "INSERT IGNORE INTO characters_quests (character_id, quest_id) values ?";
	var questData = quests.map(function(quest) {
		return([characterId, quest]);
	});

	return joinTableQuery(query, questData);
}

function importCharacterImages(thumbnail, callback){
	var uri = "http://us.battle.net/static-render/us/"+thumbnail;
	var filename = "public/images/characters/"+thumbnail.replace(new RegExp("/", 'g'),"");
	download(uri+"avatar.jpg",filename+"avatar.jpg");
	download(uri+"profilemain.jpg",filename+"profilemain.jpg", callback);
	download(uri+"inset.jpg",filename+"inset.jpg");
	// download(uri+"card.jpg",filename+"card.jpg")
}

var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
			console.log("callback chain start");
			if(callback) {
				callback();
			}
		});
	});
};

module.exports = characterUtil;