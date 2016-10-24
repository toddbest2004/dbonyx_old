"use strict";
var mysql = require("./mysql");

mysql.UserCredentials.forge({user_id:1, password:"foo"}).save().then(function(saved) {
	console.log("_______");
	// console.log(saved);
	mysql.UserCredentials.where({user_id:1}).fetch().then(function(fetched) {
		fetched.comparePassword("foo", function(err, model) {
			console.log("_____");
			console.log("foo");
			console.log(err);
			console.log(model);
			console.log("_____");
		});
		fetched.comparePassword("food", function(err, model) {
			console.log("_____");
			console.log("food");
			console.log(err);
			console.log(model);
			console.log("_____");
		});
	});
});