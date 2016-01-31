var mongoose = require('mongoose')
var Schema = mongoose.Schema

var mountSchema = new Schema({
	_id:Number, //spellId
	creatureId:Number,
	itemId:Number,
	spellId:Number,
	name:String,
	qualityId:Number,
	icon:String,
	isGround:Boolean,
	isFlying:Boolean,
	isAquatic:Boolean,
	isJumping:Boolean

})


var mount = mongoose.model('mount', mountSchema)
module.exports = mount