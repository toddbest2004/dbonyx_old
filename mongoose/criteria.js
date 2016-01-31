var mongoose = require('mongoose')
var Schema = mongoose.Schema

var criteriaSchema = new Schema({
	_id:Number,
	description:String

})


var criteria = mongoose.model('criteria', criteriaSchema)
module.exports = criteria