var mongoose = require('mongoose')
var Schema = mongoose.Schema

var bonusStat = new Schema({
	stat: Number, 
	amount: Number
})


var itemSchema = new Schema({
	_id: Number,
	itemId: Number,
	disenchantingSkillRank: Number,
	description: String,
	name: String,
	icon: String,
	stackable: Number,
	itemBind: Number,
	bonusStats: [bonusStat],
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
	hasSockets: {type: Boolean, default: false},
	isAuctionable: {type: Boolean, default: false},
	armor: Number,
	displayInfoId: Number,
	nameDescription: String,
	nameDescriptionColor: String,
	upgradable: {type: Boolean, default: false},
	heroicTooltip: {type: Boolean, default: false},
	hasRandomEnchants: {type: Boolean, default: false},
	knownRandomEnchants: [Number],
	context: String,
	bonusLists: [Number],
	weaponInfo: {},
	isWeapon: {type: Boolean, default: false},
	availableContexts: [String],
	contextDetails: {/*
		"raid-mythic":{
			bonusLists:[Number],
			bonusListDetails:{
				529: {type: 'stat', stat: 2, amount: 4},
				530: {type: 'quality', quality: 4},
				531: {type: 'suffix', name: 'Fireflash'},
				532: {type: 'description', nameDescription: 'Warforged'}
			},
			bonusStats: [bonusStat]
		}
	*/},
	itemSet: {id:Number, name: String, items:[{type: Number, ref: 'item'}], setBonuses:[{description:String,threshold:Number}]},
	hasItemSet: {type: Boolean, default: false},
	bonusSummary: {
		defaultBonusLists:[Number], 
		chanceBonusLists:[Number], 
		bonusChances:[{
			chanceType:String,
			upgrade:{upgradeType:String,name:String,id:Number},
			stats:[{statid:String,delta:Number}],
			sockets:[{socketType:String}]
		}]},
	hasItemBonusLists:Boolean,
	bonusListProcessed: Boolean,
	itemSpells:[{}]
})

var item = mongoose.model('item', itemSchema)
module.exports = item


// "itemSpells":[
// {"spellId":441,"spell":{"id":441,"name":"Healing Potion",
// 	"icon":"inv_potion_51",
// 	"description":"Restores 300 health.",
// 	"castTime":"Instant",
// 	"cooldown":"1 min cooldown"},
// "nCharges":1,
// "consumable":true,
// "categoryId":30,
// "trigger":"ON_USE"}]

// "spell":{"id":138894,"name":"Item - Proc Haste",
// 	"icon":"inv_jewelry_trinket_10",
// 	"description":"Your attacks have a chance to grant you ^0.5190 haste for 10 sec.  This effect can stack up to 5 times.  (Approximately 3.50 procs per minute)",
// 	"castTime":"Passive"},
// 	"nCharges":0,
// 	"consumable":false,
// 	"categoryId":0,
// 	"trigger":"ON_EQUIP"}]