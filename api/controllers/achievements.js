"use strict";
var express = require("express");
var router = express.Router();
var db = require("../../mongoose");

router.get("/achievements", function(req, res) {
	db.achievement.find({isCategory: false}, function(err, achievements) {
		res.json(achievements);
	});
});

router.get("/categories", function(req, res) {
	db.achievement.find({isCategory: true}, function(err, categories) {
		res.json(categories);
	});
});

module.exports = router;