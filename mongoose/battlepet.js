var mongoose = require('mongoose')
var Schema = mongoose.Schema

var battlepetSchema = new Schema({
	_id: Number,
	speciesId: Number,
	petTypeId: Number,
	creatureId: Number,
	qualityId: Number,
	name: String,
	canBattle: Boolean,
	icon: String,
	description: String,
	family: String,
	strongAgainst: [String],
	weakAgainst: [String],
	source: String,
	stats:{},
	abilities: [{
		slot: Number,
		order: Number,
		requiredLevel: Number,
		id: {type: Number, ref: 'battlepetAbility'}
	}]

})

var battlepet = mongoose.model('battlepet', battlepetSchema)
module.exports = battlepet