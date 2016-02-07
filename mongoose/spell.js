var mongoose = require('mongoose')
var Schema = mongoose.Schema

var spellSchema = new Schema({
	_id:Number,
	name:String,
	icon:String,
	description:String,
	range:String,
	powerCost:String,
	castTime:String,
	cooldown:String,
	subtext:String,
	isTradeSkill:Boolean,
	isPlayerSpell:Boolean
})

var spell = mongoose.model('spell', spellSchema)
module.exports = spell