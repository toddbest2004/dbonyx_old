var mongoose = require('mongoose')
var Schema = mongoose.Schema

var recipeSchema = new Schema({
	_id:Number,
	requiredSkill:Number,
	name:String,
	icon:String,
	profession:String,
	professionId:Number,
	reagents:[{item:{type:Number,ref:"Item"},quantity:Number}],
	creates:[{item:{type:Number,ref:"Item"},quantity:Number}]
})

var recipe = mongoose.model('recipe', recipeSchema)
module.exports = recipe