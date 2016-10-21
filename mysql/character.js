"use strict";
var bookshelf = require("./database"),
	Achievement = require("./achievement"),
	Faction = require("./faction"),
	Item = require("./item"),
	Quest = require("./quest"),
	Title = require("./title");

var Character = bookshelf.Model.extend({
	tableName: 'characters',
	achievements: function() {
		return this.belongsToMany("Achievement", "characters_achievements", "character_id", "achievement_id").withPivot(["timestamp"]);
	},
	items: function() {
		return this.belongsToMany("Item", "characters_equipment", "character_id", "item_id").withPivot(["slot_id"]);
	},
	reputation: function() {
		return this.belongsToMany("Faction", "characters_reputations", "character_id", "faction_id").withPivot(["standing", "value", "max"]);
	},
	titles: function() {
		return this.belongsToMany("Title", "characters_titles", "character_id", "title_id");
	},
	quests: function() {
		return this.belongsToMany("Quest", "characters_quests", "character_id", "quest_id");
	}
});

module.exports = bookshelf.model("Character", Character);