"use strict";
var bookshelf = require("./database"),
	UserCredentials = require("./userCredentials");

var User = bookshelf.Model.extend({
	tableName: 'users',
	credentials: function() {
		return this.hasOne("UserCredentials", "user_id");
	}
});

module.exports = bookshelf.model("User", User);