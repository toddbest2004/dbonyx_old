"use strict";
var bookshelf = require("./database"),
	Battlepet = require("./battlepet"),
	BattlepetAbility = require("./battlepetAbility");

var BattlepetAbilityJoin = bookshelf.Model.extend({
	tableName: 'battlepets_abilities',
	ability: function() {
		return this.belongsTo("BattlepetAbility", "ability_id");
	},
	battlepet: function() {
		return this.belongsTo("Battlepet", "battlepet_id");
	}
});

module.exports = bookshelf.model("BattlepeAbilityJoin", BattlepetAbilityJoin);