"use strict";
var bookshelf = require("./database");

var GuildMember = bookshelf.Model.extend({
	tableName: 'guilds_members'
});

module.exports = bookshelf.model("GuildMember", GuildMember);