var mongoose = require('mongoose')
var Schema = mongoose.Schema

var achievementSchema = new Schema({
	_id:Number,
	isCategory:Boolean,
	categoryId:Number,
	title:String,
	points:Number,
	description:String,
	reward:String,
	rewardItems:[Number],
	icon:String,
	criteria:[{}],
	accountWide:Boolean,
	factionId:Number
})


var achievement = mongoose.model('achievement', achievementSchema)
module.exports = achievement