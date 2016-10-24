"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var guildSchema = new Schema({
	// lastModified: Number,
	// lastChecked: Number,
	// name: String,
	// nameSlug: String, //lowercase normalized name for searching
	// realm: String,
	// realmSlug: String,
	// region: String,
	// battlegroup: String,
	// level: Number,
	// side: Number,
	// achievementPoints: Number,
	achievements: {
		achievementsCompleted: [Number],
		achievementsCompletedTimestamp: [Number],
		criteria: [Number],
		criteriaQuantity: [Number],
		criteriaTimestamp: [Number],
		criteriaCreated: [Number]
	},
	memberCount: Number,
	members: [{
		character: {
			name: String,
			realm: String,
			battlegroup: String,
			class: Number,
			race: Number,
			gender: Number,
			level: Number,
			achievementPoints: Number,
			spec: {
				name: String,
				role: String
			}
		},
		rank: Number
	}],
	emblem: {
		icon: Number,
		iconColor: String,
		iconColorId: Number,
		border: Number,
		borderColor: String,
		borderColorId: Number,
		backgroundColor: String,
		backgroundColorId: Number
	}
	// news: [],
	// challenge: []
});

var guild = mongoose.model('guild', guildSchema);
module.exports = guild;