'use strict';
var mysql = require("../../mysql");

var realmUtil = {};
var validRegions = ['us', 'na', 'eu'];

realmUtil.realmSplit = function(realmString) {
	var splits = realmString.toLowerCase().split("-");
	if (splits.length<2) {
		return false;
	}
	var region = splits[splits.length-1]; //last part will always be region
	if (validRegions.indexOf(region) === -1) {
		return false;
	}
	var realm = splits[0];

	return {region:region, realm:realm};
};

realmUtil.realmStringToSlug = function(realmString) {
	var splits = realmUtil.realmSplit(realmString);
	var slugId = realmUtil.realmArray[splits.region][splits.realm];
	console.log("slug "+slugId);
	return slugId;
};

realmUtil.realmArray = {"us":{}, "eu":{}};

mysql.Realm.fetchAll({withRelated:['masterSlug']}).then(function(realms) {
	realms.toJSON().forEach(function(realm) {
		realmUtil.realmArray['us'][realm.name.toLowerCase()] = realm.masterSlug.id;
	});
});

module.exports = realmUtil;