'use strict';
var request = require("request");
var db = require("../../mongoose");

var guildUtil = {};

guildUtil.importGuild = function(name, realm, region, callback) {
	db.guild.findOneAndUpdate({nameSlug:name.toLowerCase(), realmSlug:realm.toLowerCase(), region:region.toLowerCase()}, {$set:{lastChecked:Date.now()}}, function(err, guild) {
		if(err) {
			callback(err);
			return;
		}
		if(!guild) {
			console.log("New guild, creating");
			importGuild(name, realm, region, callback);
			return;
		}
		var oneDay = 1000*60*60*24;
		if(Date.now() - guild.lastChecked > oneDay) {
			console.log("Guild exists. Updating with fresh data.");
			importGuild(name, realm, region, callback);
			return;
		}
		console.log("Guild exists. No update.");
		callback(false, guild);
	});
};

var importGuild = function(name, realm, region, callback) {
	console.log("Importing guild");
	var url = "https://"+region+".api.battle.net/wow/guild/"+realm+"/"+name+"?fields=ranks,members,achievements&locale=en_US&apikey="+process.env.API;
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if (!error && response.statusCode===200) {
			body.lastChecked = Date.now();
			body.realmSlug = body.realm.toLowerCase();
			body.nameSlug = name.toLowerCase();
			body.region = region;
			// console.log(body);
			db.guild.findOneAndUpdate({nameSlug:name.toLowerCase(), realmSlug:realm.toLowerCase(), region:region.toLowerCase()}, {$set:body}, {upsert: true}, function(err, guild) {
				if(err) {
					callback(err);
					return;
				}
				callback(false, body); //send body instead of guild. Guild is null when newly created here
				return;
			});
		} else {
			console.log("Guild doesn't seem to exist.");
			callback("Guild doesn't seem to exist.");
		}
	});
};

module.exports = guildUtil;