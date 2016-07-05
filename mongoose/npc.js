var mongoose = require('mongoose')
var Schema = mongoose.Schema

var npcSchema = new Schema({
	_id:Number,
	name:String,
	sex:Number,
	classification:String,
	class:String,
	creaturetype:String,
	pvp:Boolean,
	reactionAlliance:Number,
	reactionHorde:Number,
	level:Number,
	//merchant
	isMerchant:Boolean,
	sells:[Number],
	//trainer
	isTrainer:Boolean,
	trains:[Number],
	//quests
	givesQuest:[Number],
	endsQuest:[Number],
	//loots
	lootCount:{type:Number, default:0},
	drops:[{_id:{type:Number,ref:'item'},totalCount:Number}],
})

var npc = mongoose.model('npc', npcSchema)
module.exports = npc