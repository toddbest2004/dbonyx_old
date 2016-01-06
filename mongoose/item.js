var mongoose = require('mongoose')
var Schema = mongoose.Schema

var itemSchema = new Schema({
	_id: Number,
	itemId: Number,
	disenchantingSkillRank: Number,
	description: String,
	name: String,
	icon: String,
	stackable: Number,
	itemBind: Number,
	bonusStats: [{stat: Number, amount: Number}],
	itemSpells: [],
	buyPrice: Number,
	itemClass: Number,
	itemSubClass: Number,
	containerSlots: Number,
	inventoryType: Number,
	equippable: Boolean,
	itemLevel: Number,
	maxCount: Number,
	maxDurability: Number,
	minFactionId: Number,
	minReputation: Number,
	quality: Number,
	sellPrice: Number,
	requiredSkill: Number,
	requiredLevel: Number,
	requiredSkillRank: Number,
	socketInfo: {sockets:[{type:String}],socketBonus:String},
	itemSource: {sourceId:Number, sourceType:String},
	baseArmor: Number,
	hasSockets: Boolean,
	isAuctionable: Boolean,
	armor: Number,
	displayInfoId: Number,
	nameDescription: String,
	nameDescriptionColor: String,
	upgradable: Boolean,
	heroicTooltip: Boolean,
	context: String,
	bonusLists: [],
	avalableContexts: [String],
	bonusSummary: {defaultBonusLists:[], chancebonusLists:[Number], 
		bonusChances:[{chanceType:String,
			upgrade:{upgradeType:String,name:String,id:Number},
			stats:[{statid:String,delta:Number}],
			sockets:[{socketType:String}]
		}]}
})

var item = mongoose.model('item', itemSchema)
module.exports = item