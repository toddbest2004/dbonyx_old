'use strict';
var express = require("express");
var db = require("../../mongoose");
var router = express.Router();

router.get("/", function(req, res){
	var modifiers;
	var limit = 50;
	var offset = 0;
	try{
		modifiers = JSON.parse(req.query.modifiers);
	}catch(err){
		return res.status(500).json({error:"Error reading search parameters."});
	}
	if(modifiers){
		limit = parseInt(modifiers.limit||50);
		offset = parseInt(modifiers.offset||0);
	}
	if(limit>100){
		limit=50;
	}
	console.log(limit);
	db.quest.find({}).limit(limit).skip(offset).exec(function(err, quests){
		res.json({quests:quests});
	});
});

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id);
	if(!id){
		return res.status(400).json({error:"Improper id provided."});
	}
	db.quest.findOne({_id:id}).populate('itemRewards.itemId itemChoices.itemId').exec(function(err, quest){
		if(err){return res.status(400).json({error:"Error reading from the database."});}
		if(!quest){return res.status(404).json({error:"Unable to find quest"});}
		res.json(quest);
	});
	// res.status(404).send({error:"error"});
});

module.exports = router;