"use strict";
var bookshelf = require("./database");

var Realm = bookshelf.Model.extend({
	tableName: 'realms',
	masterSlug: function() {
		return this.belongsTo("Realm", "master_id");
	},
	connectedRealms: function() {
		return this.hasMany("Realm", "master_id");
	}
});

module.exports = bookshelf.model("Realm", Realm);