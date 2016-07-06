'use strict';
var express = require("express");
var router = express.Router();
var passport = require("passport");
var db = require('../../mongoose');
var multer = require('multer');
var memStorage = multer.memoryStorage();
var maxSize = 1024*1024;
var upload = multer({storage:memStorage, limits:{fileSize:maxSize}}).single('importFile');
var async = require('async');

router.post("/import", function(req, res, next){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			console.log('uploading import data');
			upload(req, res, function(err){
				if(err){
					if(err.code==="LIMIT_FILE_SIZE"){
						return res.status(413).json({"error":"File size too large."});
					}
					return res.status(400).json({"error":"Unknown error importing file."});
				}
				try{
					var processString = req.file.buffer.toString('ascii');
					var obj = JSON.parse(processString.slice(processString.indexOf('"'),processString.lastIndexOf('"')+1));

					obj = JSON.parse(obj);
					// console.log(s)
					// var obj = JSON.parse(s)
					// console.log(obj)
					processObject(obj);
				}catch(e){
					console.log(e);
					return res.status(400).json({"error":"Unable to parse import file."});
				}
				res.json({result:'success'});
			});			
	  	} else {
	  		res.status(401).json({error:"You must be logged in to import data."});
		}
	})(req, res);
});

module.exports = router;

function processObject(obj){
	// console.log(obj.units)
	for(var key in obj){
		console.log(key);
	}
	// processUnits(obj.units);
	// processEvents(obj.events);
	processQuests(obj.quests);
}

function processUnits(units){
	if(!units){
		return;
	}
	for(var key in units){
		// var id;
		var unit = units[key];
		var insertUnit = {};
		insertUnit._id = parseInt(key)||0;
		insertUnit.sex = parseInt(unit.sex);
		insertUnit.name = typeof(unit.name)==='string'?unit.name:'';
		insertUnit.classification = typeof(unit.classification)==='string'?unit.classification:'';
		insertUnit.creaturetype = typeof(unit.creaturetype)==='string'?unit.creaturetype:'';
		insertUnit.class = typeof(unit.class)==='string'?unit.class:'';
		insertUnit.pvp = unit.pvp?true:false;
		if(unit.reactionAlliance){
			insertUnit.reactionAlliance = parseInt(unit.reactionAlliance);
		}
		if(unit.reactionHorde){
			insertUnit.reactionHorde = parseInt(unit.reactionHorde);
		}
		insertUnit.level = parseInt(unit.level);
		createUnit(insertUnit);
	}
}

function createUnit(unit){
	db.npc.findOneAndUpdate({_id:unit._id},{$set:unit},{upsert:true}).exec(function(err, npc){
		if(err){
			console.log("Error importing npc: ");
			console.log(unit);
		}
	});
}

function processEvents(events){
	if(!events){
		return;
	}
	for(var key in events){
		if(events[key].type==="loot"){
			processLootEvent(events[key]);
		}
	}
}

function processLootEvent(event){
	var npcs = {};
	if(event.source==="Creature"){
		//make sure drops is an array of drop elements
		if(event.drops&&Array.isArray(event.drops)){
			event.drops.forEach(function(drop){
				//drop MUST be a string or is not valid
				if(drop&&typeof(drop)==='string'){
					var dropArray = drop.split('-');
					//after split, drop array should be [npcId,spawnId,itemId/money,quantity dropped]
					//split must be length 4 or is invalid
					if(dropArray.length===4&&parseInt(dropArray[0])&&parseInt(dropArray[3])){
						var npcId = parseInt(dropArray[0]);
						if(!npcs[npcId]){
							npcs[npcId]={drops:{},seen:[]};
						}

						var spawnId = dropArray[1];
						if(npcs[npcId].seen.indexOf(spawnId)===-1){
							npcs[npcId].seen.push(spawnId);
						}
						npcs[npcId].drops[dropArray[2]]=npcs[npcId].drops[dropArray[2]]||0;
						npcs[npcId].drops[dropArray[2]]+=parseInt(dropArray[3]);
						// console.log(dropArray[0]);
					}
				}
			});
			for(var npcId in npcs){
				npcQueue.push({id:npcId, details:npcs[npcId]},function(){console.log('done');});
			}
		}
	}
	// console.log(event);
}

var npcQueue = async.queue(function(task, callback){
	createLootEvent(task.id,task.details, callback);
});

function createLootEvent(id, details, callback){
	db.npc.findOne({_id:id}).exec(function(err, npc){
		if(err||!npc){return;}
		for(var key in details.drops){
			var newkey=key;
			if(key==='money'){newkey=0;}
			if(npc.drops.id(newkey)===null){
				npc.drops.push({_id:newkey,totalCount:details.drops[key]});
			}else{
				var subdoc = npc.drops.id(newkey);
				subdoc.totalCount+=details.drops[key];
			}
			// console.log(npc);
		}
		npc.lootCount+=details.seen.length;
			npc.save(function(err){
				if(err){
					console.log(err);
				}
				console.log(details);
				callback();
			});
		// console.log(details);
		// console.log(npc.drops);
	});
	// console.log(id);
	// console.log(details);
}

var questQueue = async.queue(function(task, callback){
	updateQuest(task.quest, callback);
});

function processQuests(quests){
	if(!quests){
		return;
	}
	for(var id in quests){
		var cur = quests[id];
		var quest = {};
		quest._id = parseInt(id);
		if(cur.alliance){
			quest.isAlliance = true;
		}
		if(cur.horde){
			quest.isHorde = true;
		}
		if(cur.description&&typeof(cur.description)==='string'){
			quest.description = cur.description;
		}
		if(cur.questObjectives&&typeof(cur.questObjectives)==='string'){
			quest.questObjectives = cur.questObjectives;
		}
		if(cur.title&&typeof(cur.title)==='string'){
			quest.title = cur.title;
		}
		if(typeof(cur.frequency)==='number'){
			quest.frequency=parseInt(cur.frequency);
		}
		quest.itemRewards = [];
		if(cur.rewards&&Array.isArray(cur.rewards)){
			cur.rewards.forEach(function(reward){
				quest.itemRewards.push({itemId:parseInt(reward.id),quantity:parseInt(reward.numItems)});
			});
		}
		quest.itemChoices = [];
		if(cur.itemChoices&&Array.isArray(cur.itemChoices)){
			cur.itemChoices.forEach(function(reward){
				quest.itemChoices.push({itemId:parseInt(reward.id),quantity:parseInt(reward.numItems)});
			});
		}

		questQueue.push({quest:quest},function(){console.log("quest done");});
		// console.log(id);
		// console.log(quests[id]);
		// console.log(quest);
	}
}

function updateQuest(quest, cb){
	db.quest.findOneAndUpdate({_id:quest._id,title:quest.title}, {$set:quest}).exec(function(){
		console.log(quest._id, quest.title);
		cb();
	});
}

// function processProfessions(profs){

// }

// function processMerchants(merch){

// }