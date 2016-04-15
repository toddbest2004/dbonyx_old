var mongoose = require('mongoose')
var Schema = mongoose.Schema

var battlepetAbilitySchema = new Schema({
	_id: Number,
	name: String,
	icon: String,
	cooldown: Number,
	rounds: Number,
	petTypeId: Number,
	isPassive: Boolean,
	hideHints: Boolean
})

var battlepetAbility = mongoose.model('battlepetAbility', battlepetAbilitySchema)
module.exports = battlepetAbility