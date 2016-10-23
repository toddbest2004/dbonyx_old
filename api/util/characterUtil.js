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
var realmUtil = require("./realmUtil");
var itemConstants = require("./itemConstants");
var characterRelatedArray = ["achievements", "battlepets", "items", "mounts", "quests", "reputation", "titles"];

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
		mysql.Character.where({name:name, slug_id:slugId}).fetch({withRelated:characterRelatedArray}).then(function(character) {
			callback(false, character);
		});
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
			updateCharacterDetails(newCharacter, body, realmSplit.region, callback);
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
			updateCharacterDetails(newCharacter, body, realmSplit.region, callback);
		}).catch(function(err) {
			console.log(err);
			callback("There was an error updating character");
			return;
		});
	});
}

function updateCharacterDetails(character, body, region, callback) {
	console.log("updating character");

	//these update functions should run in parallel to increase import speed.
	Promise.all([
		updateCharacterBasic(character.id, body, region),
		updateCharacterAchievements(character.id, body.achievements),
		updateCharacterEquipment(character.id, body.items),
		updateCharacterMounts(character.id, body.mounts),
		updateCharacterPets(character.id, body.pets),
		updateCharacterQuests(character.id, body.quests),
		updateCharacterReputation(character.id, body.reputation),
		updateCharacterTitles(character.id, body.titles)
	]).then(function() {
		mysql.Character.where({id:character.id}).fetch({withRelated:characterRelatedArray}).then(function(character) {
			callback(false, character.toJSON());
		}).catch(function(err) {
			console.log(err);
			throwError(callback);
		});
	}).catch(function(err) {
		console.log(err);
		throwError(callback);
	});

	// character.criteria=[];
	// for(var i=0; i<body.achievements.criteria.length;i++){
	// 	character.criteria.push({
	// 		id:body.achievements.criteria[i],
	// 		quantity:body.achievements.criteriaQuantity[i],
	// 		timestamp:body.achievements.criteriaTimestamp[i],
	// 		created:body.achievements.criteriaCreated[i]
	// 	});
	// }
	
	// character.appearance=body.appearance;
	// character.stats=body.stats;
	// character.professions=body.professions;
	// character.progression=body.progression;
	// character.talents=body.talents;
	// character.pvp=body.pvp;
}

function joinTableQuery(query, data) {
	return new Promise(function(resolve, reject) {
		rawConnection.query(query, data, function(err) {
			if (err) {
				console.log(err);
				console.log("Error importing character's quests");
				reject();
				return;
			}
			resolve();
		});
	});
}

function updateCharacterBasic(characterId, body, region) {
	var query = "UPDATE characters SET ? WHERE id = ?";
	var thumbnail = body.thumbnail.replace("avatar.jpg","");
	importCharacterImages(thumbnail);
	thumbnail = thumbnail.replace(new RegExp("/", 'g'),"").replace("thumbnail.jpg","");
	var info = [{class:body.class,race:body.race,gender:body.gender,level:body.level,faction:body.faction,achievementPoints:body.achievementPoints,thumbnail:thumbnail, calcClass:body.calcClass, guildName:body.guild.name, guildRealm:body.guild.realm+'-'+region}, characterId];

	return joinTableQuery(query, info);
}

function updateCharacterAchievements(characterId, achievements) {
	var query = "INSERT IGNORE INTO characters_achievements (character_id, achievement_id, timestamp) VALUES ?";
	var achievementData = [];
	for (var i=0; i < achievements.achievementsCompleted.length; i++) {
		achievementData.push([characterId, achievements.achievementsCompleted[i], new Date(achievements.achievementsCompletedTimestamp[i])]);
	}

	return joinTableQuery(query, [achievementData]);
}

function updateCharacterEquipment(characterId, itemInfo) {
	var query = "INSERT INTO characters_equipment (character_id, item_id, slot_id) VALUES ?";
	delete itemInfo.averageItemLevel;
	delete itemInfo.averageItemLevelEquipped;
	var itemSlots = [];
	for (var slotName in itemInfo) {
		itemSlots.push([characterId, itemInfo[slotName].id, itemConstants.itemSlots.indexOf(slotName)]);
	}

	return joinTableQuery(query, [itemSlots]);
}

function updateCharacterMounts(characterId, mounts) {
	var query = "INSERT IGNORE INTO characters_mounts (character_id, mount_id) VALUES ?";
	var mountData = mounts.collected.map(function(mount) {
		return [characterId, mount.creatureId];
	});

	return joinTableQuery(query, [mountData]);
}

function updateCharacterPets(characterId, pets) {
	var query = "INSERT IGNORE INTO characters_pets (character_id, battlepet_guid, battlepet_id, breed, quality, level, isFirstAbilitySlotSelected, isSecondAbilitySlotSelected, isThirdAbilitySlotSelected) VALUES ?";
	var petData = pets.collected.map(function(pet) {
		return [characterId, pet.battlePetGuid, pet.stats.speciesId, pet.stats.breedId, pet.stats.petQualityId, pet.stats.level, pet.isFirstAbilitySlotSelected, pet.isSecondAbilitySlotSelected, pet.isThirdAbilitySlotSelected];
	});

	return joinTableQuery(query, [petData]);
}

function updateCharacterReputation(characterId, factions) {
	var query = "INSERT IGNORE INTO characters_reputation (character_id, faction_id, standing, value, max) values ?";
	var factionData = factions.map(function(faction) {
		return([characterId, faction.id, faction.standing, faction.value, faction.max]);
	});

	return joinTableQuery(query, [factionData]);
}

function updateCharacterTitles(characterId, titles) {
	var query = "INSERT IGNORE INTO characters_titles (character_id, title_id) values ?";
	var titleData = titles.map(function(title) {
		return([characterId, title.id]);
	});

	return joinTableQuery(query, [titleData]);
}

function updateCharacterQuests(characterId, quests) {
	var query = "INSERT IGNORE INTO characters_quests (character_id, quest_id) values ?";
	var questData = quests.map(function(quest) {
		return([characterId, quest]);
	});

	return joinTableQuery(query, [questData]);
}

function importCharacterImages(thumbnail){
	console.log(thumbnail);
	var uri = "http://us.battle.net/static-render/us/"+thumbnail;
	var filename = "public/images/characters/"+thumbnail.replace(new RegExp("/", 'g'),"");
	console.log(filename);
	download(uri+"avatar.jpg",filename+"avatar.jpg");
	download(uri+"profilemain.jpg",filename+"profilemain.jpg");
	download(uri+"inset.jpg",filename+"inset.jpg");
	// download(uri+"card.jpg",filename+"card.jpg")
}

var download = function(uri, filename){
	request.head(uri, function(err, res, body){
		request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
			console.log("Character image downloaded.");
		});
	});
};

function throwError(callback) {
	callback("There was a database error");
}

module.exports = characterUtil;