'use strict';
var express = require("express");
var router = express.Router();

var characterUtil = require("../util/characterUtil");

var globalTimestamp;

router.get("/search", function(req, res){
	globalTimestamp = new Date();
	if(!req.query.name||!req.query.realm) {
		res.status(400).json({error:"Missing one or more required fields."});
		return;
	}
	var name = req.query.name.capitalize();
	findCharacter(req.query.realm, name,res);
});

module.exports = router;

function findCharacter(realm, name, res){
	characterUtil.getCharacter(name, realm, function(err, character) {
		console.log(new Date() - globalTimestamp);
		if(err||!character) {
			return res.status(400).json({error: err});
		}
		res.json({status:"success", count:1, character:character});
	});
}