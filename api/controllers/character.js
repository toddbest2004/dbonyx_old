var express = require("express");
var request = require("request");
var router = express.Router();

var realmArray
var regionArray = ['us', 'eu']

var db = require("../../mongoose");
// var characterData = require("../strangerogue.json")
// var itemPositions = require("../static/itemPositions")
// var util = require("./modules/util")
db.realm.find({}, function(err, realms){
	realmArray = realms.map(function(realm){return realm.name.toLowerCase()})
})



router.get("/load", function(req, res){
	console.log(req.query)
	if(!req.query.name){
		res.status(400).json({error:"No name provided."})
		return
	}
	if(req.query.realm){
		findCharacter(req.query.realm,req.query.name,res)
	}else{
		findMultipleCharacters(req.query.name, res)
	}
	
})

router.post("/", function(req, res){
})

router.get("/importing", function(req, res){
})

router.get("/equipment", function(req, res){
})

router.get("/achievements", function(req, res){
})

router.get("/mounts", function(req, res){
})

router.get("/pets", function(req, res){
})

router.get("/reputation", function(req,res){

})

router.get("/:region/:realm/:charactername", function(req, res){
	characterDetails = {name:req.params.charactername, realm:req.params.realm, region:req.params.region}
	//res.render("character/character.ejs", {character:characterDetails})
	res.send(characterData)
})

module.exports = router

function findCharacter(realm, name, res){
	var realmSplit = realm.split('-')
	if(realmSplit.length!==2){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	var region = realmSplit[1].toLowerCase()
	var realmName = realmSplit[0]
	db.character.findOne({name:name,realm:realmName,region:region}, function(err, character){
		if(err){
			res.status(400).json({error:"Error reading database."})
			return
		}
		if(!character){
			importCharacter(name,realmName,region,function(result){
				if(!result){
					res.status(404).json({error:"Not Found.", result:false})
					return
				}
				res.json({status:"success", count:1, character:{name:name,realm:realmName,region:region}})
			})
		}else{
			res.json({status:"success", count:1, character:{name:name,realm:realmName,region:region}})
		}
	})
}

function findMultipleCharacters(name, res){
	if(typeof(name)!=='string'){
		res.status(400).json({error:"Improper query string."})
		return
	}
	db.character.find({name:name}, function(err, characters){
		if(err){
			res.status(400).json({error:"Error reading database."})
			return
		}
		if(characters.length===0){
			res.status(404).json({error:"Not Found.", result:false})
			return
		}
		if(characters.length===1){
			var character = characters[0]
			res.json({status:"success", count:1, character:{name:character.name,realm:character.realm,region:character.region.toUpperCase()}})
			return
		}
		//characters.length>1
		var characterArray = []
		for(var i=0; i<characters.length;i++){
			var character = characters[i]
			characterArray.push({name:character.name,realm:character.realm,region:character.region,level:character.level,faction:character.faction})
		}
		res.json({status:"success", count:characters.count, characters:characterArray})
		return
	})
}

function importCharacter(name, realm, region, callback){
	console.log("Importing Character: "+name)
	var url = "http://"+region+".battle.net/api/wow/character/"+realm+"/"+name+"?fields=achievements,appearance,feed,guild,hunterPets,items,mounts,pets,petSlots,progression,professions,pvp,quests,reputation,stats,talents,titles,audit&locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			processCharacter(name, realm, region, body, callback)
		}else{
			callback(false)
		}
	})
}

function processCharacter(name, realm, region, body, callback){
	db.character.findOne({name:name,realm:realm,region:region}, function(err, character){
		if(err){
			callback(false)
			return
		}
		if(!character){
			db.character.create({name:name,realm:realm,region:region, importing:true}, function(err, character){
				character.class=body.class
				character.race=body.race
				character.gender=body.gender
				character.level=body.level
				character.achievementPoints=body.achievementPoints
				character.thumbnail=body.thumbnail
				character.calcClass=body.calcClass
				character.faction=body.faction
				character.quests=body.quests
				character.titles=body.titles
				character.mounts=body.mounts.collected.map(function(mount){
					return mount.spellId
				})
				character.criteria=[]
				for(var i=0; i<body.achievements.criteria.length;i++){
					character.criteria.push({
						id:body.achievements.criteria[i],
						quantity:body.achievements.criteriaQuantity[i],
						timestamp:body.achievements.criteriaTimestamp[i],
						created:body.achievements.criteriaCreated[i]
					})
				}
				character.achievements=[]
				for(var i=0;i<body.achievements.achievementsCompleted.length;i++){
					character.achievements.push({
						id:body.achievements.achievementsCompleted[i],
						timestamp:body.achievements.achievementsCompletedTimestamp[i]
					})
				}
				character.reputation=body.reputation
				character.appearance=body.appearance
				character.items=body.items
				character.stats=body.stats
				character.professions=body.professions
				character.progression=body.progression
				character.talents=body.talents
				character.pvp=body.pvp
				character.save(function(err){
					callback(true)
				})
			})
		}else{
			callback(true)
			//TODO: Update character information
			console.log("character exists")
		}
	})
}