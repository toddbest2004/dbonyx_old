"use strict";
var request = require("request");
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});

var achievementArray = [];
var categoryArray = [];

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
			insertAllAchievements();
			insertAllCategories();
		}else{
			console.log(response.statusCode);
		}
	});
}

function processCategory(category, parentId, order) {
	var categoryId = category.id;
	var catCount = 0;
	var achCount = 0;
	categoryArray.push([category.id, category.name, parentId, order]);
	if(category.categories) {
		category.categories.forEach(function(cat) {
			processCategory(cat, categoryId, catCount);
			catCount++;
		});
	}
	if(category.achievements) {
		category.achievements.forEach(function(ach) {
			achievementArray.push([ach.id, ach.title, ach.points, ach.description, ach.icon, ach.accountWide, ach.factionId, categoryId, achCount]);
			achCount++;
		});
	}
}

function insertAllAchievements() {
	var query = "INSERT INTO achievements (id, title, points, description, icon, accountWide, faction_id, category_id, displayOrder) VALUES ?;";
	connection.query(query, [achievementArray], function(err, res) {
		console.log(err);
		console.log(res);
	});
}

function insertAllCategories() {
	var query = "INSERT INTO achievementCategories (id, name, parent_id, displayOrder) VALUES ?;";
	connection.query(query, [categoryArray], function(err, res) {
		console.log(err);
		console.log(res);
	});
}