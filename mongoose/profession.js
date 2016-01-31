var mongoose = require('mongoose')
var Schema = mongoose.Schema

var professionSchema = new Schema({
	_id:Number,
	name:String,
	icon:String,
	recipes:[{
		_id:Number,
		requiredSkill:Number,
		reagents:[{item:{type:Number,ref:"Item"},quantity:Number}],
		creates:[{item:{type:Number,ref:"Item"},quantity:Number}]
	}]

})


var profession = mongoose.model('profession', professionSchema)
module.exports = profession