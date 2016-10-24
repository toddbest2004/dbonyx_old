"use strict";
var express = require("express");
var router = express.Router();
var guildUtils = require("../util/guildUtil");

router.get("/", function(req, res) {
	var name = req.query.name,
		realm = req.query.realm,
		region = req.query.region;

	guildUtils.getGuild(name, realm, region, function(err, guild) {
		if(err||!guild) {
			res.status(404).json({error:"Guild not found."});
			return;
		}
		res.send(guild);
	});
});

module.exports = router;