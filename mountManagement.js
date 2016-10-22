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

setTimeout(get_mounts, 2000);

function get_mounts() {
	var url = "https://us.api.battle.net/wow/mount/?locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			// console.log(body.mounts);
			console.log(body.mounts.length);
			var mounts = body.mounts.map(function(mount) {
				return [
					mount.name,
					mount.spellId,
					mount.creatureId,
					mount.itemId,
					mount.qualityId,
					mount.icon,
					mount.isGround,
					mount.isFlying,
					mount.isAquatic,
					mount.isJumping
					];
			});
			console.log(mounts.length)
			connection.query("INSERT IGNORE INTO mounts (name, spell_id, id, item_id, quality, icon, isGround, isFlying, isAquatic, isJumping) VALUES ?", [mounts], function(err, res) {
				console.log(err);
				console.log(res);
			});
		} else {
			console.log(response.statusCode);
		}
	});
}