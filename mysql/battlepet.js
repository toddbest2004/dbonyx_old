"use strict";
var bookshelf = require("./database"),
	BattlepetAbility = require("./battlepetAbility");

var Battlepet = bookshelf.Model.extend({
	tableName: 'battlepets',
	abilities: function() {
		return this.belongsToMany("BattlepetAbility", "battlepets_abilities", "battlepet_id", "ability_id").withPivot(["slot", "abilityOrder", "requiredLevel", "details"]);
	}
});

module.exports = bookshelf.model("Battlepet", Battlepet);