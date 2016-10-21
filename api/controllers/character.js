'use strict';
var express = require("express");
var request = require("request");
var fs = require("fs");
var router = express.Router();
var encodeUrl = require('encodeurl');
var mysql = require("../../mysql");

var realmUtil = require("../util/realmUtil");

var realmArray = realmUtil.realmArray;

var characterUtil = require("../util/characterUtil");

var globalTimestamp;

router.get("/search", function(req, res){
	globalTimestamp = new Date();
	if(!req.query.name||!req.query.realm) {
		res.status(400).json({error:"Missing one or more required fields."});
		return;
	}
	var name = req.query.name.capitalize();
	findCharacter(req.query.realm, name,res);
});

// router.post("/", function(req, res){
// });

// router.get("/importing", function(req, res){
// })

router.get("/professions", function(req, res){
	var name = req.query.name.capitalize();
	var realm = req.query.realm;
	var region = req.query.region.toLowerCase();
	if(!verifyRealm(realm, region)){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({name:name, region:region, realm:realm}).populate("professions.primary.recipes professions.secondary.recipes").exec(function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		res.json({professions:character.professions});
	});
});

router.get("/items", function(req, res){
	var name = req.query.name.capitalize();
	var realm = req.query.realm;
	var region = req.query.region.toLowerCase();
	if(!verifyRealm(realm, region)){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({name:name, region:region, realm:realm}).lean().exec(function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		// console.log(character.items)
		// for(var key in character.items){
		// 	// console.log(key)
		// 	if(character.items[key].stats){
		// 		// console.log(key)
		// 		character.items[key].stats.forEach(function(stat){
		// 			// console.log(stat)
		// 		});
		// 		// console.log('_____')
		// 	}
		// }
		res.json({items:character.items});
	});
});

router.get("/achievements", function(req, res){
	var name = req.query.name.capitalize();
	var realm = req.query.realm;
	var region = req.query.region.toLowerCase();
	if(!verifyRealm(realm, region)){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({name:name,realm:realm,region:region}).populate('achievements.id').exec(function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		// console.log(character.achievements)
		res.json({status:"success",achievements:character.achievements});
	});
});

router.get("/mounts", function(req, res){
	var name = req.query.name.toLowerCase();
	var realm = req.query.realm.toLowerCase();
	var region = req.query.region.toLowerCase();
	if (!verifyRealm(realm, region)) {
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({nameSlug:name,realmSlug:realm,region:region}).populate('mounts').exec(function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		res.json({status:"success",mounts:character.mounts});
	});
});

router.get("/battlepets", function(req, res){
	var name = req.query.name.capitalize();
	var realm = req.query.realm;
	var region = req.query.region.toLowerCase();
	if(!verifyRealm(realm, region)){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({name:name,realm:realm,region:region}).populate('battlepets.collected.details').exec(function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		res.json({status:"success",battlepets:character.battlepets});
	});
});

router.get("/reputation", function(req,res){
	var name = req.query.name.capitalize();
	var realm = req.query.realm;
	var region = req.query.region.toLowerCase();
	if(!verifyRealm(realm, region)){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.findOne({name:name,realm:realm,region:region},function(err, character){
		if(err||!character){
			res.status(404).json({error:"Character not found."});
			return;
		}
		res.json({status:"success",reputation:character.reputation});
	});
});


module.exports = router;

function findCharacter(realm, name, res){
	characterUtil.getCharacter(name, realm, function(err, character) {
		console.log(new Date() - globalTimestamp);
		if(err||!character) {
			return res.status(400).json({error: err});
		}
		res.json({status:"success", count:1, character:character});
	});
}

function findMultipleCharacters(name, res){
	if(typeof(name)!=='string'){
		res.status(400).json({error:"Improper query string."});
		return;
	}
	db.character.find({name:name}, function(err, characters){
		if(err){
			res.status(400).json({error:"Error reading database."});
			return;
		}
		if(characters.length===0){
			res.status(404).json({error:"Not Found.", result:false});
			return;
		}
		if(characters.length===1){
			var character = characters[0];
			res.json({status:"success", count:1, character:{name:character.name,realm:character.realm,region:character.region.toUpperCase(),level:character.level,faction:character.faction,thumbnail:character.thumbnail,guildName:character.guildName}});
			return;
		}
		//characters.length>1
		var characterArray = [];
		for(var i=0; i<characters.length;i++){
			var character = characters[i];
			characterArray.push({name:character.name,realm:character.realm,region:character.region.toUpperCase(),level:character.level,faction:character.faction,thumbnail:character.thumbnail});
		}
		res.json({status:"success", count:characters.count, characters:characterArray});
		return;
	});
}

function importCharacter(name, realm, region, callback){
	console.log("Importing Character: "+name);
	console.log(name, realm, region);
	var url = "https://"+region+".api.battle.net/wow/character/"+realm+"/"+name+"?fields=achievements,appearance,feed,guild,hunterPets,items,mounts,pets,petSlots,progression,professions,pvp,quests,reputation,stats,talents,titles,audit&locale=en_US&apikey="+process.env.API;
	url = encodeUrl(url);
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		// console.log(response)
		if(!error && response.statusCode===200){
			processCharacter(name, realm, region, body, callback);
		}else{
			// console.log(response.statusCode);
			// console.log(body);
			// console.log(url);
			// console.log(encodeUrl(url));
			callback(false);
		}
	});
}

function processCharacter(name, realm, region, body, callback){
	db.character.findOne({name:name,realm:realm,region:region}, function(err, character){
		if(err){
			callback(false);
			return;
		}
		if(!character){
			db.character.create({name:name,realm:realm,region:region, importing:true}, function(err, character){
				updateCharacter(character, body, callback);
			});
		}else{
			if(!character.lastModified||character.lastModified<body.lastModified){
				updateCharacter(character, body, callback);
			}else {
				//character up to date
				callback(true);
			}
		}
	});
}

function updateCharacter(character, body, callback) {
	body.thumbnail = body.thumbnail.replace("avatar.jpg","");
	character.lastModified=body.lastModified;
	character.lastChecked=Date.now();
	character.class=body.class;
	character.race=body.race;
	character.gender=body.gender;
	character.level=body.level;
	character.achievementPoints=body.achievementPoints;
	character.thumbnail=body.thumbnail.replace(new RegExp("/", 'g'),"").replace("thumbnail.jpg","");
	character.calcClass=body.calcClass;
	character.faction=body.faction;
	if(body.guild) {
		character.guildName=body.guild.name;
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
	character.reputation=body.reputation;
	character.appearance=body.appearance;
	character.items=body.items;
	character.stats=body.stats;
	character.professions=body.professions;
	character.progression=body.progression;
	character.talents=body.talents;
	character.pvp=body.pvp;
	character.save(function(err){
		importCharacterImages(body.thumbnail, callback);
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
				callback(true);
		});
	});
};

function verifyRealm(realm, region){
	if(realmArray.indexOf(realm.toLowerCase())===-1){
		return false;
	}
	if(regionArray.indexOf(region.toLowerCase())===-1){
		return false;
	}
	return true;
}