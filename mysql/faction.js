"use strict";
var bookshelf = require("./database");

var Faction = bookshelf.Model.extend({
	tableName: 'factions'
});

module.exports = bookshelf.model("Faction", Faction);