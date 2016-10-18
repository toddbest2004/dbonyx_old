"use strict";
var bookshelf = require("./database"),
	Realm = require("./realm"),
	Item = require("./item");

var Auction = bookshelf.Model.extend({
	tableName: 'auctions',
	item: function() {
		return this.belongsTo("Item", "item_id");
	},
	slug: function() {
		return this.belongsTo("Realm", "slug_id");
	}
});

module.exports = bookshelf.model("Auction", Auction);