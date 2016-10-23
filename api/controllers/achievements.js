"use strict";
var express = require("express");
var router = express.Router();
var mysql = require("../../mysql");

router.get("/achievements", function(req, res) {
	mysql.Achievement.where({}).fetchAll().then(function(achievements) {
		res.json(achievements.toJSON());
	});
});

router.get("/categories", function(req, res) {
	mysql.AchievementCategory.where({parent_id:0}).orderBy("displayOrder", "ASC").fetchAll({withRelated:["achievements", "subCategories.achievements"]}).then(function(categories) {
		categories = categories.toJSON();
		categories.forEach(function(cat, idx) {
			cat.subCategories.forEach(function(sub) {
				console.log(sub.name, sub.achievements.length);
			});
		});
		res.json(categories);
	});
});

module.exports = router;