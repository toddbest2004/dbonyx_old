"use strict";
var bookshelf = require("./database");

var Title = bookshelf.Model.extend({
	tableName: 'titles'
});

module.exports = bookshelf.model("Title", Title);