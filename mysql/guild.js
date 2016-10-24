"use strict";
var bookshelf = require("./database"),
	GuildMember = require("./guildMember");

var Guild = bookshelf.Model.extend({
	tableName: 'guilds',
	members: function() {
		return this.hasMany("GuildMember", "guildId");
	}
});

module.exports = bookshelf.model("Guild", Guild);