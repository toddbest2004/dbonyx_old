"use strict";
var bookshelf = require("./database");

var Item = bookshelf.Model.extend({
	tableName: 'items'
});

module.exports = bookshelf.model("Item", Item);