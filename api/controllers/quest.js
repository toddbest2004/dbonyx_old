'use strict';
var express = require("express");
var mysql = require("../../mysql");

var router = express.Router();

router.get("/", function(req, res){
	var limit = parseInt(req.query.limit||50);
	var offset = parseInt(req.query.offset||0);
	if(limit>100){
		limit=50;
	}

	mysql.Quest.query({}).where({}).count().then(function(count) {
		mysql.Quest.query(function(qb) {
			qb.limit(limit).offset(offset);
		}).where({}).orderBy("id", "ASC").fetchAll().then(function(quests) {
			res.json({quests:quests.toJSON(), count:count});
		});
	});
});

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id);
	if(!id){
		return res.status(400).json({error:"Improper id provided."});
	}
	mysql.Quest.where({id:id}).fetch().then(function(quest) {
		res.json(quest.toJSON());
	});
});

module.exports = router;