"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var achievementSchema = new Schema({
	_id:Number,
	category: {type:Number, ref:'achievementCategory'},
	title:String,
	points:Number,
	description:String,
	reward:String,
	rewardItems:[Number],
	icon:String,
	criteria:[{
		id: {type:Number, ref:'achievementCriteria'},
		description: String,
		orderIndex: Number,
		max: Number
	}],
	accountWide:Boolean,
	factionId:Number,
	order: Number
});


var achievement = mongoose.model('achievement', achievementSchema);
module.exports = achievement;