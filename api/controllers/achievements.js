"use strict";
var express = require("express");
var router = express.Router();
var db = require("../../mongoose");

router.get("/achievements", function(req, res) {
	db.achievement.find({}).exec(function(err, achievements) {
		res.json(achievements);
	});
});

router.get("/categories", function(req, res) {
	db.achievementCategory.find({parentCategory:0}).sort({order:1}).populate(["achievements", {path:"categories",populate:["achievements"]}]).exec(function(err, categories) {
		res.json(categories);
	});
});

module.exports = router;