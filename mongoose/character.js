"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var characterSchema = new Schema({
	lastModified: Number,
	lastChecked: Number,
	name: String,
	region: String,
	importing: Boolean,
	slug_id: {type: Schema.Types.ObjectId, ref: 'Realm'},
	class: Number,
	race: Number,
	gender: Number,
	level: Number,
	achievementPoints: Number,
	thumbnail: String,
	calcClass: String,
	faction: Number,
	guildName: String,
	guildRealm: String,
	guild_id: Number,
	// guild: {type: Schema.Types.ObjectId, ref: 'Guild'},
	// feed:
	appearance:{faceVariation:Number,skinColor:Number,hairVariation:Number,hairColor:Number,featureVariation:Number,showHelm:Boolean,showCloak:Boolean},
	progression:{},
	professions:{
		primary: [{
			recipes: [{type:Number, ref:"spell"}],
			max: Number,
			rank: Number,
			icon: String,
			name: String,
			id: Number
		}],
		secondary: [{
			recipes: [{type:Number, ref:"spell"}],
			max: Number,
			rank: Number,
			icon: String,
			name: String,
			id: Number
		}]
	},
	stats:{},
	talents:{},
	pvp:{},
	items:{
		averageItemLevel:Number,
		averageItemLevelEquipped:Number,
		head:{},
		neck:{},
		shoulder:{},
		back:{},
		chest:{},
		tabard:{},
		shirt:{},
		wrist:{},
		hands:{},
		waist:{},
		legs:{},
		feet:{},
		finger1:{},
		finger2:{},
		trinket1:{},
		trinket2:{},
		mainHand:{},
		offHand:{}},
	reputation:[{
		id:Number,
		name:String,
		standing:Number,
		value:Number,
		max:Number}],
	mounts:[{type:Number, ref:"mount"}],
	battlepets:{
		numCollected: Number,
		numNotCollected: Number,
		collected: [{
			details: {type:Number, ref:"battlepet"}, //species Id
			stats: {},
			name:String,
			creatureName: String,
			isFavorite: Boolean,
			isFirstAbilitySlotSelected: Boolean,
			isSecondAbilitySlotSelected: Boolean,
			isThirdAbilitySlotSelected: Boolean,
			canBattle: Boolean
		}]
	},
	quests:[{type:Number, ref:"Quest"}],
	criteria:[{
		id:Number,
		quantity:Number,
		timestamp:Number,
		created:Number}],
	achievements:[{id:{type:Number,ref:'achievement'},timestamp:Number}],
	titles:[{id:Number,name:String}]
});

var character = mongoose.model('character', characterSchema);
module.exports = character;