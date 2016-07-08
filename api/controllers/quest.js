'use strict';
var express = require("express");
var db = require("../../mongoose");
var router = express.Router();

router.get("/", function(req, res){

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