'use strict';
var express = require("express");
var db = require("../../mongoose");
var router = express.Router();

router.get("/", function(req, res){
	var limit = parseInt(req.query.limit||50);
	var offset = parseInt(req.query.offset||0);
	if(limit>100){
		limit=50;
	}
	var questQuery = db.quest.find({});
	questQuery.limit(limit).skip(offset).exec(function(err, quests){
		questQuery.limit(0).skip(0).count(function(err,count){
			res.json({quests:quests,count:count});
		});
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