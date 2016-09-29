"use strict";
var request = require("request");
var db = require('./mongoose');

get_achievements();

function get_achievements(){
	var url = "https://us.api.battle.net/wow/data/character/achievements?apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			for(var i=0;i<body.achievements.length;i++){
				processCategory(body.achievements[i], 0, i);
			}
		}else{
			console.log(response.statusCode);
		}
	});
}

function processCategory(category, parentId, order) {
	var categoryId = category.id;
	var categories = [];
	var achievements = [];
	var catCount = 0;
	var achCount = 0;
	if(category.categories) {
		category.categories.forEach(function(cat) {
			categories.push(cat.id);
			processCategory(cat, categoryId, catCount);
			catCount++;
		});
	}
	if(category.achievements) {
		category.achievements.forEach(function(ach) {
			achievements.push(ach.id);
			insertAchievement(ach, categoryId, achCount);
			achCount++;
		});
	}
	insertCategory(category, parentId, categories, achievements, order);
}


function insertAchievement(achievement, categoryId, order){
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
		factionId: achievement.factionId,
		order: order
	}, function() {
		// console.log("achievement done");
	});
}

function insertCategory(category, parentId, categories, achievements, order) {
	db.achievementCategory.create({
		_id: category.id,
		name: category.name,
		parentCategory: parentId,
		categories: categories,
		achievements: achievements,
		order: order
	}, function() {
		console.log(order);
		console.log("cat done");
	});
}