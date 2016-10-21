"use strict";
var bookshelf = require("./database");

var Mount = bookshelf.Model.extend({
	tableName: 'mounts'
});

module.exports = bookshelf.model("Mount", Mount);