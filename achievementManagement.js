"use strict";
var request = require("request");
var db = require('./mongoose');

var total = 0;

get_achievements();

function get_achievements(){
	var url = "https://us.api.battle.net/wow/data/character/achievements?apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			for(var i=0;i<body.achievements.length;i++){
				processCategory(body.achievements[i], 0);
			}
		}else{
			console.log(response.statusCode);
		}
	});
}

function processCategory(category, parentId) {
	var categoryId = category.id;
	var categories = [];
	var achievements = [];
	if(category.categories) {
		category.categories.forEach(function(cat) {
			categories.push(cat.id);
			processCategory(cat, categoryId);
		});
	}
	if(category.achievements) {
		category.achievements.forEach(function(ach) {
			achievements.push(ach.id);
			insertAchievement(ach, categoryId);
		});
	}
	insertCategory(categoryId, parentId, categories, achievements);
}


function insertAchievement(achievement, categoryId){
	db.achievement.create({
		_id: achievement.id,
		category: categoryId,
		title: achievement.title,
		points: achievement.points,
		description: achievement.description,
		reward: achievement.reward,
		rewardItems: achievement.rewardItems,
		icon: achievement.icon,
		criteria: achievement.criteria,
		accountWide: achievement.accountWide,
		factionId: achievement.facitonId
	}, function() {
		console.log("achievement done");
	});
}

function insertCategory(categoryId, parentId, categories, achievements) {
	db.achievementCategory.create({
		_id: categoryId,
		parentCategory: parentId,
		categories: categories,
		achievements: achievements
	}, function() {
		console.log("cat done");
	});
}