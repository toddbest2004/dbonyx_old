'use strict';
var request = require("request");
var mysql = require("../../mysql");
var raw = require("mysql");
var connection = raw.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});

var realmUtil = require("./realmUtil");
var realmArray = realmUtil.realmArray;

var guildUtil = {};

guildUtil.getGuild = function(name, realm, region, callback) {
	console.log("starting");
	realm = realm.toLowerCase();
	region = region.toLowerCase();
	if (!realmArray[region] || !realmArray[region][realm]) {
		return callback("Unknown realm or region");
	}
	var slugId = realmArray[region][realm];
	console.log(slugId, realm, region);
	mysql.Guild.where({name:name, slugId:slugId}).fetch({withRelated:["members"]}).then(function(guild) {
		console.log("fetch fired");
		if (!guild) {
			createGuild(name, realm, region, slugId, callback);
			return;
		}
		var oneDay = 1000*60*60*24;
		guild = guild.toJSON();
		if(Date.now() - guild.lastChecked > oneDay) {
			console.log("Character exists. Updating with fresh data.");
			updateGuild(name, guild.id, realm, region, slugId, callback);
			return;
		}
		console.log("Guild up to date.");
		callback(false, guild);
	}).catch(function(err) {
		console.log(err);
		callback(err);
	});
};

function createGuild(name, realm, region, slugId, callback) {
	importGuildFromServer(name, realm, region).then(function(body) {
		var now = Date.now();
		body.lastChecked = now;
		mysql.Guild.forge({
			name: name,
			slugId: slugId,
			nameSlug: name.toLowerCase(),
			lastModified: body.lastModified,
			lastChecked: body.lastChecked,
			level: body.level,
			faction: body.side,
			achievementPoints: body.achievementPoints
		}).save().then(function(guild) {
			guild = guild.toJSON();
			updateGuildMembers(guild, body.members).then(function() {
				mysql.Guild.where({id: guild.id}).fetch({withRelated:["members"]}).then(function(guild) {
					callback(false, guild);
				});
			});
		});
	}).catch(function(err) {
		console.log(err);
	});
}

function updateGuild(name, guildId, realm, region, slugId, callback) {
	importGuildFromServer(name, realm, region).then(function(body) {
		var now = Date.now();
		body.lastChecked = now;
		mysql.Guild.forge({
			name: name,
			slugId: slugId,
			nameSlug: name.toLowerCase(),
			lastModified: body.lastModified,
			lastChecked: body.lastChecked,
			level: body.level,
			faction: body.side,
			achievementPoints: body.achievementPoints,
			id: guildId
		}).save().then(function(guild) {
			guild = guild.toJSON();
			updateGuildMembers(guild, body.members).then(function() {
				mysql.Guild.where({id: guild.id}).fetch({withRelated:["members"]}).then(function(guild) {
					callback(false, guild);
				});
			});
		});
	}).catch(function(err) {
		console.log(err);
	});
}

function updateGuildMembers(guild, members) {
	console.log("updating guild members");
	return new Promise(function(resolve, reject) {
		var memberData = [];
		members.forEach(function(member) {
			var rank = member.rank;
			member = member.character;
			var spec = member.spec;
			if(!spec) {
				spec = {name: "Unknown", role: "Unknown"};
			}
			var memberInfo = [guild.id, member.name, member.realm, member.class, member.level, spec.name, spec.role, rank, member.achievementPoints];
			memberData.push(memberInfo);
		});
		var query = "INSERT IGNORE INTO guilds_members (guildId, name, realm, class, level, roleName, roleSpec, rank, achievementPoints) VALUES ?;";
		connection.query(query, [memberData], function(err, res) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			resolve();
		});
	});
}

var importGuildFromServer = function(name, realm, region) {
	console.log("Importing guild");
	var url = "https://"+region+".api.battle.net/wow/guild/"+realm+"/"+name+"?fields=ranks,members,achievements&locale=en_US&apikey="+process.env.API;
	return new Promise(function(resolve, reject) {
		request({
			uri: url,
			json: true
		}, function(error, response, body){
			if (!error && response.statusCode===200) {
				body.lastChecked = Date.now();
				body.realmSlug = body.realm.toLowerCase();
				body.nameSlug = name.toLowerCase();
				body.region = region;
				resolve(body);
			} else {
				console.log("Guild doesn't seem to exist.");
				reject("Guild doesn't seem to exist.");
			}
		});
	});
};

module.exports = guildUtil;