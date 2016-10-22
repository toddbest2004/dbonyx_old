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

// function findMultipleCharacters(name, res){
// 	if(typeof(name)!=='string'){
// 		res.status(400).json({error:"Improper query string."});
// 		return;
// 	}
// 	db.character.find({name:name}, function(err, characters){
// 		if(err){
// 			res.status(400).json({error:"Error reading database."});
// 			return;
// 		}
// 		if(characters.length===0){
// 			res.status(404).json({error:"Not Found.", result:false});
// 			return;
// 		}
// 		if(characters.length===1){
// 			var character = characters[0];
// 			res.json({status:"success", count:1, character:{name:character.name,realm:character.realm,region:character.region.toUpperCase(),level:character.level,faction:character.faction,thumbnail:character.thumbnail,guildName:character.guildName}});
// 			return;
// 		}
// 		//characters.length>1
// 		var characterArray = [];
// 		for(var i=0; i<characters.length;i++){
// 			var character = characters[i];
// 			characterArray.push({name:character.name,realm:character.realm,region:character.region.toUpperCase(),level:character.level,faction:character.faction,thumbnail:character.thumbnail});
// 		}
// 		res.json({status:"success", count:characters.count, characters:characterArray});
// 		return;
// 	});
// }