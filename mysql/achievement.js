"use strict";
var bookshelf = require("./database");

var AchievementCategory = require("./achievementCategory");

var Achievement = bookshelf.Model.extend({
	tableName: 'achievements',
	category: function() {
		return this.belongsTo("AchievementCategory", "category_id");
	}
});

module.exports = bookshelf.model("Achievement", Achievement);