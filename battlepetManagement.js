"use strict";
var request = require("request");
var db = require('./mongoose');
var mysql = require("./mysql");
var async = require('async');

var petQueue = async.queue(function(speciesId, callback){
	if(!speciesId){
		callback();
	}else{
		getBattlepetDetails(speciesId, callback);
	}
}, 1);

function getBattlepets(){
	var url = "https://us.api.battle.net/wow/pet/?locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		console.log(error);
		console.log(body);
		if(!error && response.statusCode===200){
			for(var i=0;i<body.pets.length;i++){
				processPet(body.pets[i]);
			}
		}else{
			console.log(response.statusCode);
		}
	});
}

function processPet(body){
	var pet = body;
	var newPet = {};
	newPet.id = pet.stats.speciesId;
	newPet.speciesId = pet.stats.speciesId;
	newPet.petTypeId = pet.typeId;
	newPet.creatureId = pet.creatureId;
	newPet.qualityId = pet.stats.petQualityId;
	newPet.name = pet.name;
	newPet.canBattle = pet.canBattle;
	newPet.icon = pet.icon;
	newPet.description = pet.description;
	newPet.source = pet.source;
	newPet.speciesId = pet.stats.speciesId;
	newPet.health = pet.stats.health;
	newPet.power = pet.stats.power;
	newPet.speed = pet.stats.speed;
	// console.log(pet)
	mysql.Battlepet.forge(newPet).save(null, {method: 'insert'}).then(function(saved) {
		petQueue.push(newPet, function(){console.log(newPet.speciesId+" done");});
	}).catch(function(err) {
		//duplicate key errors
		petQueue.push(newPet.speciesId, function(){console.log(newPet.speciesId+"done");});
	});
}

getBattlepets();

function getBattlepetDetails(speciesId, callback) {
	console.log("processing: "+speciesId);
	var url = "https://us.api.battle.net/wow/pet/species/"+speciesId+"?locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			var pet = {};
			pet.id = body.speciesId;
			pet.description = body.description;
			pet.source = body.source;

			mysql.Battlepet.forge(pet).save().then(function(saved) {});
			body.abilities.forEach(function(ability) {
				var petAbility = {
					battlepet_id: body.speciesId,
					ability_id: ability.id,
					slot: ability.slot,
					abilityOrder: ability.order,
					requiredLevel: ability.requiredLevel
				};
				var newAbility =  {
					id: ability.id,
					name: ability.name,
					icon: ability.icon,
					cooldown: ability.cooldown,
					rounds: ability.rounds,
					petTypeId: ability.petTypeId,
					isPassive: ability.isPassive,
					hideHints: ability.hideHints
				};
				mysql.BattlepetAbility.forge(newAbility).save(null, {method: 'insert'}).then(function() {
					console.log("ability " + ability.id + " saved");
				}).catch(function(){});//catch duplicates
				mysql.BattlepetAbilityJoin.forge(petAbility).save(null, {method: 'insert'}).then(function() {
					console.log("ability associated.");
				}).catch(function(){});//catch duplicates
			});
			callback();
		}else{
			console.log("error: "+response.statusCode);
			callback();
		}
	});
}

//outdated mongo function, should be reinstated at some point for better battlepet stats

// function getBattlepetStats(pet, callback){
// 	var url = "https://us.api.battle.net/wow/pet/stats/"+pet._id+"?level=20&breedId=3&qualityId=0&locale=en_US&apikey="+process.env.API
// 	request({uri:url,json:true},function(error, response, body){
// 		if(!error && response.statusCode===200){
// 			var health = (body.health-150)/20
// 			var power = (body.power-10)/20
// 			var speed = (body.speed-10)/20
// 			pet.stats = {health:health,power:power,speed:speed}
// 		}else{
// 			console.log("NO STATS")
// 			pet.stats={}
// 		}
// 		pet.save(pet,function(err, pet){
// 			// console.log(pet)
// 			callback()
// 		})
// 		// callback()
// 	})
// }