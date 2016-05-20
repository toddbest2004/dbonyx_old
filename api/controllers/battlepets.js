var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/", function(req, res){
	var offset = parseInt(req.query.offset)||0
	var limit = parseInt(req.query.limit)||25
	if(limit>50)
		limit = 25
	db.battlepet.find().skip(offset).limit(limit).populate('abilities._id').exec(function(err, pets){
		if(err||!pets)
			return res.status(404).json({error:"Unable to find pets."})
		res.send(pets)
	})
})

router.get("/species/:id", function(req, res){
	var id = parseInt(req.params.id)
	if(!id)
		return res.status(400).json({error:"Improper id supplied."})
	db.battlepet.findOne({speciesId:id}).populate('abilities._id').exec(function(err, pet){
		if(err||!pet)
			return res.status(404).json({error:"Unable to find pet."})
		res.send(pet)
	})
})

router.get("/ability/:id", function(req, res){
	var id = parseInt(req.params.id)
	if(!id)
		return res.status(400).json({error:"Improper id supplied."})
	db.battlepetAbility.findOne({_id:id}).exec(function(err, ability){
		if(err||!ability)
			return res.status(404).json({error:"Unable to find pet ability."})
		res.send(ability)
	})
})



module.exports = router