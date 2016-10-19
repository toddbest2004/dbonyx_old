'use strict';

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

module.exports = realmUtil;