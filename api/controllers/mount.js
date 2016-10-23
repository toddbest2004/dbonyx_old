"use strict";
var express = require("express");
var router = express.Router();

var mysql = require("../../mysql");

router.get("/:id", function(req, res) {
	var id = parseInt(req.params.id);
	if (!id) {
		res.status(400).json({error:"Improper Query String."});
		return;
	}
	mysql.Mount.where({id:id}).fetch().then(function(mount) {
		if (!mount) {
			res.status(404).json({error:"Mount not found."});
			return;
		}
		console.log(mount);
		res.json({mount:mount});
	});
});

module.exports = router;