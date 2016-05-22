var request = require("request");
var db = require('./mongoose');
var async = require('async')

var petQueue = async.queue(function(speciesId, callback){
	if(!speciesId){
		callback()
	}else{
		getBattlepetDetails(speciesId, callback)
	}
}, 1)

function getBattlepets(){
	var url = "https://us.api.battle.net/wow/pet/?locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			for(var i=0;i<body.pets.length;i++){
				processPet(body.pets[i])
			}
		}else{
			console.log(response.statusCode)
		}
	});
}

function processPet(body){
	var pet = body
	// console.log(body)
	pet._id = pet.stats.speciesId
	pet.speciesId = pet.stats.speciesId
	db.battlepet.create(pet, function(err, newpet){
		console.log(pet.stats.speciesId)
		petQueue.push(pet.speciesId, function(){console.log(pet.speciesId+"done")})
	})
}

getBattlepets()

function getBattlepetDetails(speciesId, callback){
	console.log("processing: "+speciesId)
	var url = "https://us.api.battle.net/wow/pet/species/"+speciesId+"?locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			db.battlepet.findById(speciesId).exec(function(err, pet){
				pet.petTypeId = body.petTypeId
				pet.description = body.description
				pet.source = body.source
				for(var i=0;i<body.abilities.length;i++){
					body.abilities[i].details = body.abilities[i].id
					body.abilities[i]._id = body.abilities[i].id
					db.battlepetAbility.create(body.abilities[i], function(err, ability){
					})
				}
				pet.abilities = body.abilities
				getBattlepetStats(pet, callback)
				
			})
		}else{
			console.log("error: "+response.statusCode)
			callback()
		}
	})
}


function getBattlepetStats(pet, callback){
	var url = "https://us.api.battle.net/wow/pet/stats/"+pet._id+"?level=20&breedId=3&qualityId=0&locale=en_US&apikey="+process.env.API
	request({uri:url,json:true},function(error, response, body){
		if(!error && response.statusCode===200){
			var health = (body.health-150)/20
			var power = (body.power-10)/20
			var speed = (body.speed-10)/20
			pet.stats = {health:health,power:power,speed:speed}
		}else{
			console.log("NO STATS")
			pet.stats={}
		}
		pet.save(pet,function(err, pet){
			// console.log(pet)
			callback()
		})
		// callback()
	})
}