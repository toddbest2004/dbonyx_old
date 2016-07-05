'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questSchema = new Schema({
	_id:Number,
	title:String,
	reqLevel:Number,
	level:Number,
	suggestedPartyMembers:Number,
	category:String,
	isAlliance:Boolean,
	isHorde:Boolean,
	frequency:Number,
	description:String,
	questObjectives:String,
	questRewardMoney:Number,
	itemRewards:[{itemId:{type:Number,ref:'item'},quantity:Number}],
	itemChoices:[{itemId:{type:Number,ref:'item'},quantity:Number}],
	factionChanges:[{factionId:Number,change:Number}],//not yet implemented
});

var quest = mongoose.model('quest', questSchema);
module.exports = quest;