"use strict";
var bookshelf = require("./database"),
	Achievement = require("./achievement"),
	Battlepet = require("./battlepet"),
	Faction = require("./faction"),
	Item = require("./item"),
	Mount = require("./mount"),
	Quest = require("./quest"),
	Title = require("./title");

var Character = bookshelf.Model.extend({
	tableName: 'characters',
	achievements: function() {
		return this.belongsToMany("Achievement", "characters_achievements", "character_id", "achievement_id").withPivot(["timestamp"]);
	},
	battlepets: function() {
		return this.belongsToMany("Battlepet", "characters_pets", "character_id", "battlepet_id").withPivot(["battlepet_guid", "breed", "quality", "level", "isFirstAbilitySlotSelected", "isSecondAbilitySlotSelected", "isThirdAbilitySlotSelected"]);
	},
	items: function() {
		return this.belongsToMany("Item", "characters_equipment", "character_id", "item_id").withPivot(["slot_id"]);
	},
	mounts: function() {
		return this.belongsToMany("Mount", "characters_mounts", "character_id", "mount_id");
	},
	reputation: function() {
		return this.belongsToMany("Faction", "characters_reputation", "character_id", "faction_id").withPivot(["standing", "value", "max"]);
	},
	titles: function() {
		return this.belongsToMany("Title", "characters_titles", "character_id", "title_id");
	},
	quests: function() {
		return this.belongsToMany("Quest", "characters_quests", "character_id", "quest_id");
	}
});

module.exports = bookshelf.model("Character", Character);