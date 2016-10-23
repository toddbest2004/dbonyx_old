"use strict";
var bookshelf = require("./database"),
	Stat = require("./stat");

var Item = bookshelf.Model.extend({
	tableName: 'items',
	stats: function() {
		return this.belongsToMany("Stat", "items_stats", "itemId", "statId").withPivot(["amount"]);
	}
});

module.exports = bookshelf.model("Item", Item);