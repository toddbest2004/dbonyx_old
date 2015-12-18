var express = require("express");
var router = express.Router();

var db = require("../../mongoose");
// var characterData = require("../strangerogue.json")
// var itemPositions = require("../static/itemPositions")
// var util = require("./modules/util")



router.get("/*", function(req, res){
	res.status(404).json({error:"Not Found.", result:false})
})

router.post("/", function(req, res){
	//tests for character exisiting are in the module
	var character = require("./modules/character.js")
	character.import(req, res)
})

router.get("/importing", function(req, res){
	res.render("character/importing")
})

router.get("/equipment", function(req, res){
	if(typeof req.session.characterId != 'undefined'){
		db.character.findById(req.session["characterId"], {include:[db.item]}).then(function(character){
			if(character==null){
				characterError(req, res, 'Error fetching character data, please try again.');
			}
			//TODO: ensure items display in the correct location
			res.render("character/equipment", {character:character, itemPositions:itemPositions})
		})
	}else{
		characterError(req, res, 'You must select a character');
	}
})

router.get("/achievements", function(req, res){
	if(typeof req.session.characterId != 'undefined'){
		db.character.findById(req.session["characterId"]).then(function(character){
			if(character==null){
				characterError(req, res, 'Error fetching character data, please try again.');
			}else{
				db.achievementCategory.findAll({where:{parentId:null}, order:["orderIndex"], include:[{model:db.achievementCategory, as:"Child"}, {model:db.achievement}]}).then(function(categories){
					res.render("character/achievements", {character:character,categories:categories})
				})
			}
		})
	}else{
		characterError(req, res, 'You must select a character');
	}
})

router.get("/mounts", function(req, res){
	if(typeof req.session.characterId != 'undefined'){
		db.character.findById(req.session.characterId).then(function(character){
			character.getMounts().then(function(collected){
				var collectedIds=[]
				for(var i=0; i<collected.length;i++){
					collectedIds.push(collected[i].id)
				}
				db.mount.findAll({where:{id:{$notIn:collectedIds}}}).then(function(uncollected){
					res.render("character/mounts",{character:character,uncollected:uncollected,collected:collected})
				})
			})
		})
	}else{
		characterError(req, res, 'You must select a character');
	}
})

router.get("/pets", function(req, res){
	if(typeof req.session.characterId != 'undefined'){
		db.character.findById(req.session.characterId).then(function(character){
			character.getBattlepets().then(function(collected){
				var collectedIds=[]
				for(var i=0; i<collected.length;i++){
					collectedIds.push(collected[i].id)
				}
				db.battlepet.findAll({where:{id:{$notIn:collectedIds}}}).then(function(uncollected){
					res.render("character/pets",{character:character,uncollected:uncollected,collected:collected})
				})
			})
		})
	}else{
		characterError(req, res, 'You must select a character');
	}
})

router.get("/reputation", function(req,res){
	if(typeof req.session.characterId != 'undefined'){
		db.character.findById(req.session.characterId).then(function(character){
			character.getFactions().then(function(factions){
				res.render("character/reputation",{character:character,factions:factions})
			})
		})
	}else{
		characterError(req, res, 'You must select a character');
	}
})

router.get("/:region/:realm/:charactername", function(req, res){
	characterDetails = {name:req.params.charactername, realm:req.params.realm, region:req.params.region}
	//res.render("character/character.ejs", {character:characterDetails})
	res.send(characterData)
})

module.exports = router

function characterError(req, res, error){
	req.session.characterId = undefined;
	req.flash('warning', error);
	res.redirect('/character/');
}