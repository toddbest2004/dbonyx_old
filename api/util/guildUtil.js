'use strict';
var request = require("request");
var db = require("../../mongoose");

var guildUtil = {};

guildUtil.importGuild = function(name, realm, region, callback) {
	db.guild.findOneAndUpdate({nameSlug:name.toLowerCase(), realm:realm.toLowerCase()}, {$set:{lastChecked:Date.now()}}, function(err, guild) {
		if(err) {
			callback(err);
			return;
		}
		if(!guild) {
			importGuild(name, realm, region, callback);
			return;
		}
		var oneDay = 1000*60*60*24;
		if(Date.now() - guild.lastChecked > oneDay) {
			importGuild(name, realm, region, callback);
			return;
		}
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
			body.realm = body.realm.toLowerCase();
			body.nameSlug = name.toLowerCase();
			db.guild.create(body, function(err, guild) {
				if(err||!guild) {
					callback(err);
					return;
				}
				callback(false, guild);
				return;
			});
		} else {
			callback(response.statusCode);
		}
	});
};

module.exports = guildUtil;