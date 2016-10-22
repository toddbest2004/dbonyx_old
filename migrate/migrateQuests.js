"use strict";
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});
var mongo = require("../mongoose");

setTimeout(function(){ 
	getQuestsAndImport(0);
}, 2000);

function getQuestsAndImport(id) {
	var queryData = [];
	mongo.quest.find({_id:{$gt:id}}).limit(1000).sort({'_id':1}).exec(function(err, quests) {
		if(!quests) {
			console.log("Done migrating basic item info");
			return;
		}
		quests.forEach(function(quest) {
			queryData.push([
				quest._id,
				quest.title,
				quest.reqLevel,
				quest.level,
				quest.category,
				quest.suggestedPartyMembers
			]);
		});
		if(queryData.length>0) {
			sendQueryPacket(queryData);
			queryData = [];
		}
	});
}

function sendQueryPacket(queryData) {
	console.log("sending packet");
	var query = "INSERT IGNORE INTO quests ("
		+ "id, title, reqLevel, level, category, suggestedPartyMembers"
		+ ") values ?;";
	connection.query(query, [queryData], function(err, res) {
		console.log(err);
		console.log(res);
		if (queryData.length>0) {
			getQuestsAndImport(queryData[queryData.length-1][0]);
		}
	});
}