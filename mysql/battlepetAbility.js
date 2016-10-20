"use strict";
var bookshelf = require("./database"),
	Battlepet = require("./battlepet");

var BattlepetAbility = bookshelf.Model.extend({
	tableName: 'battlepetAbilities',
	abilities: function() {
		return this.belongsToMany("Battlepet", "battlepets_abilities", "ability_id", "battlepet_id").withPivot(["slot", "abilityOrder", "requiredLevel", "details"]);
	}
});

module.exports = bookshelf.model("BattlepetAbility", BattlepetAbility);