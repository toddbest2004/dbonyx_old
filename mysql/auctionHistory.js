"use strict";
var bookshelf = require("./database"),
	Realm = require("./realm"),
	Item = require("./item");

var AuctionHistory = bookshelf.Model.extend({
	tableName: 'auctionHistories',
	item: function() {
		return this.belongsTo("Item", "item_id");
	},
	slug: function() {
		return this.belongsTo("Realm", "slug_id");
	}
});

module.exports = bookshelf.model("AuctionHistory", AuctionHistory);