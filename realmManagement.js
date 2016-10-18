"use strict";
var request = require("request");
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});

connection.connect();

var realms = {};
var masterSlugs = {};
var region = 'us';

getRealms();

function getRealms(){
	//console.log("loading")
	var url = "https://"+region+".api.battle.net/wow/realm/status?locale=en_US&apikey="+process.env.API;
	console.log(url);
	request({
		uri: url,
		json: true
	}, function(error, response, body) {
		console.log("Data returned");
		if (!error && response.statusCode===200) {
			console.log("Starting Process");
			addRealm(body.realms, region, 0);
		} else {
			console.log("error: "+response.statusCode);
		}
	});
}

function addRealm(realms, region, count){
	var realm = realms[count];
	var attributes = [region, realm.name, realm.slug, 0, realm.type, realm.population, realm.battlegroup, realm.locale, realm.timezone, realm.queue];
	var query = connection.query("INSERT IGNORE INTO realms (region, name, slug, auctiontouch, type, population, battlegroup, locale, timezone, queue) VALUES (?)", [attributes], function(err, res) {
		if(err) {
			console.log(err);
			return;
		}
		console.log(res.insertId);
		updateMasterSlugs(realm, res.insertId, function() {
			count++;
			if(count < realms.length) {
				addRealm(realms, region, count);
			} else {
				console.log("done");
				connection.end();
				return;
			}
		});
	});
	realms[realm.name] = realm.slug;
}

function updateMasterSlugs(realm, id, cb) {
	if (!masterSlugs[realm.slug]) {
		masterSlugs[realm.slug] = id;
		connection.query("UPDATE realms SET isMasterSlug = ?, master_id = ? WHERE id = ?", [true, id, id], function(err, res) {
			if(err) {
				console.log(err);
				return;
			}
			realm.connected_realms.forEach(function(connected) {
				masterSlugs[connected] = id;
			});
			console.log('good so far');
			if(cb) {
				cb();
			}
		});
	} else {
		var masterId = masterSlugs[realm.slug];
		connection.query("UPDATE realms SET isMasterSlug = ?, master_id = ? WHERE id = ?", [false, masterId, id], function(err, res) {
			if(err) {
				console.log(err);
				return;
			}
			console.log("good so far");
			if(cb) {
				cb();
			}
		});
	}
}