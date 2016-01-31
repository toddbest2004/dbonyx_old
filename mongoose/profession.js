var mongoose = require('mongoose')
var Schema = mongoose.Schema

var professionSchema = new Schema({
	_id:Number,
	name:String,
	icon:String,
	recipes:[{type:Number, ref:"Recipe"}]
})


var profession = mongoose.model('profession', professionSchema)
module.exports = profession
