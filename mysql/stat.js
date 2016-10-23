"use strict";
var bookshelf = require("./database");

var Stat = bookshelf.Model.extend({
	tableName: 'stats'
});

module.exports = bookshelf.model("Stat", Stat);