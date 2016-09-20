'use strict';
var request = require("request");
var db = require("../../mongoose");
var fs = require("fs");

var characterUtil = {};

characterUtil.getCharacter = function(name, realm, region, callback) {
	if(!name||!realm||!region) {
		callback("Missing one or more required fields");
		return;
	}
	name = name.toLowerCase();
	realm = realm.toLowerCase();
	region = region.toLowerCase();
	db.character.findOneAndUpdate({nameSlug:name, realmSlug:realm, region:region}, {$set:{lastChecked:Date.now()}}, function(err, character) {
		if(err){
			callback("There was an error finding character in our database.");
			return;
		}
		if(!character) {
			importCharacterFromServer(name, realm, region, callback);
			return;
		}
		var oneDay = 1000*60*60*24;
		if(Date.now() - character.lastChecked > oneDay) {
			console.log("Guild exists. Updating with fresh data.");
			importCharacterFromServer(name, realm, region, callback);
			return;
		}
		//Character exists and is up to date
		console.log("character up to date")
		callback(false, character);
	});
};

var importCharacterFromServer = function(name, realm, region, callback) {
	console.log("Importing character");
	var url = "https://"+region+".api.battle.net/wow/character/"+realm+"/"+name+"?fields=achievements,appearance,feed,guild,hunterPets,items,mounts,pets,petSlots,progression,professions,pvp,quests,reputation,stats,talents,titles,audit&locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if (!error && response.statusCode===200) {
			body.lastChecked = Date.now();
			body.realmSlug = realm;
			body.nameSlug = name;
			// body.region = region;
			// console.log(body.mounts);
			db.character.findOneAndUpdate({nameSlug:name, realmSlug:realm, region:region}, {}, {upsert: true, new:true}, function(err, character) {
				// console.log(err);
				// console.log(character);
				if(err) {
					callback("There was an error updating character in the database.");
					return;
				}
				updateCharacter(character, body, callback);
				// callback(false, body); //send body instead of guild. Guild is null when newly created here
				return;
			});
		} else {
			console.log("Character doesn't seem to exist.");
			callback("Character doesn't seem to exist.");
		}
	});
};

function updateCharacter(character, body, callback) {
	console.log("updating character")
	// console.log(body)
	body.thumbnail = body.thumbnail.replace("avatar.jpg","");
	character.lastModified=body.lastModified;
	character.lastChecked=Date.now();
	character.name = body.name;
	character.realm = body.realm;
	character.class=body.class;
	character.race=body.race;
	character.gender=body.gender;
	character.level=body.level;
	character.achievementPoints=body.achievementPoints;
	character.thumbnail=body.thumbnail.replace(new RegExp("/", 'g'),"").replace("thumbnail.jpg","");
	character.calcClass=body.calcClass;
	character.faction=body.faction;
	if(body.guild) {
		character.guildName = body.guild.name;
		character.guildRealm = body.guild.realm;
	}
	character.quests=body.quests;
	character.titles=body.titles;
	character.mounts=body.mounts.collected.map(function(mount){
		return mount.spellId;
	});
	character.criteria=[];
	for(var i=0; i<body.achievements.criteria.length;i++){
		character.criteria.push({
			id:body.achievements.criteria[i],
			quantity:body.achievements.criteriaQuantity[i],
			timestamp:body.achievements.criteriaTimestamp[i],
			created:body.achievements.criteriaCreated[i]
		});
	}
	character.achievements=[];
	for(var i=0;i<body.achievements.achievementsCompleted.length;i++){
		character.achievements.push({
			id:body.achievements.achievementsCompleted[i],
			timestamp:body.achievements.achievementsCompletedTimestamp[i]
		});
	}
	
	character.battlepets = body.pets;
	character.battlepets.collected.forEach(function(pet) {
		pet.details = pet.stats.speciesId;
	});

	character.reputation=body.reputation;
	character.appearance=body.appearance;
	character.items=body.items;
	character.stats=body.stats;
	character.professions=body.professions;
	character.progression=body.progression;
	character.talents=body.talents;
	character.pvp=body.pvp;
	character.save(function(err){
		importCharacterImages(body.thumbnail, function(){
			callback(false, character);
		});
	});
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
			if(callback)
				callback();
		});
	});
};

module.exports = characterUtil;