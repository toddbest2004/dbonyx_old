"use strict";
var bookshelf = require("./database");

var Quest = bookshelf.Model.extend({
	tableName: 'quests'
});

module.exports = bookshelf.model("Quest", Quest);