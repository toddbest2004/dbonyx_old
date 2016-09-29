"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var achievementCategorySchema = new Schema({
	_id:Number,
	parentCategory: Number,
	categories:[{type:Number, ref:'achievementCategory'}],
	achievements:[{type:Number, ref:'achievement'}],
	name:String,
	order: Number
});


var achievementCategory = mongoose.model('achievementCategory', achievementCategorySchema);
module.exports = achievementCategory;