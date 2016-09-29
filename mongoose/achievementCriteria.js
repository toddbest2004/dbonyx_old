"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var achievementCriteriaSchema = new Schema({
	_id: Number,
	description: String,
	orderIndex: Number,
	max: Number
});


var achievementCriteria = mongoose.model('achievementCriteria', achievementCriteriaSchema);
module.exports = achievementCriteria;