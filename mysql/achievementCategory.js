"use strict";
var bookshelf = require("./database");

var Achievement = require("./achievement");

var AchievementCategory = bookshelf.Model.extend({
	tableName: 'achievementCategories',
	parentCategory: function() {
		return this.belongsTo("AchievementCategory", "parent_id");
	},
	subCategories: function() {
		return this.hasMany("AchievementCategory", "parent_id");
	},
	achievements: function() {
		return this.hasMany("Achievement", "category_id");
	}
});

module.exports = bookshelf.model("AchievementCategory", AchievementCategory);