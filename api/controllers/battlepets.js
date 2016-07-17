'use strict';
var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

var petFamilies = ['humanoid','dragonkin','flying','undead','critter','magical','elemental','beast','water','mechanical'];

var breeds = {
	3:{h:0.25,p:0.25,s:0.25,n:"B/B"},
	4:{h:0,p:1,s:0,n:"P/P"},
	5:{h:0,p:0,s:1,n:"S/S"},
	6:{h:1,p:0,s:0,n:"H/H"},
	7:{h:0.45,p:0.45,s:0,n:"H/P"},
	8:{h:0,p:0.45,s:0.45,n:"P/S"},
	9:{h:0.45,p:0,s:0.45,n:"H/S"},
	10:{h:0.2,p:0.45,s:0.2,n:"P/B"},
	11:{h:0.2,p:0.2,s:0.45,n:"S/B"},
	12:{h:0.45,p:0.2,s:0.2,n:"H/B"},
};

router.get("/", function(req, res){
	var offset = parseInt(req.query.offset)||0;
	var limit = parseInt(req.query.limit)||25;
	var filters;
	try{
		filters = JSON.parse(req.query.filters) || null;
	}catch(err){
		filters = null;
	}
	var battlepetQuery = db.battlepet.find().skip(offset).limit(limit).populate('abilities.details');
	if(filters){
		if(filters.families&&Array.isArray(filters.families)){
			var familyArray = [];
			for(var i=0;i<petFamilies.length;i++){
				if(filters.families[i])
					familyArray.push(i);
			}
			if(familyArray.length>0)
				battlepetQuery.where({petTypeId:{$in:familyArray}});
		}
	}
	if(limit>50)
		limit = 25;
	battlepetQuery.exec(function(err, pets){
		if(err||!pets){
			console.log(err);
			return res.status(404).json({error:"Unable to find pets."});
		}
		res.send(pets);
	});
});

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id);
	if(!id)
		return res.status(400).json({error:"Improper id supplied."});
	db.battlepet.findOne({speciesId:id}).populate('abilities.details').exec(function(err, pet){
		if(err||!pet)
			return res.status(404).json({error:"Unable to find pet."});
		res.send(pet);
	});
});

router.get("/ability/:id", function(req, res){
	var id = parseInt(req.params.id);
	if(!id)
		return res.status(400).json({error:"Improper id supplied."});
	db.battlepetAbility.findOne({_id:id}).exec(function(err, ability){
		if(err||!ability)
			return res.status(404).json({error:"Unable to find pet ability."});
		res.send(ability);
	});
});



module.exports = router;