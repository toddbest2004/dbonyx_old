var mongoose = require('mongoose')
var Schema = mongoose.Schema

var auctionSchema = new Schema({
	_id: Number,
	item: {type: Number, ref: 'item'},
	owner: String,
	firstbid: Number,
	bid: Number,
	buyout: Number,
	bidPerItem: Number,
	buyoutPerItem: Number,
	quantity: Number,
	rand: Number,
	seed: Number,
	timeLeft: String,
	startTime: String,
	touch: Number,
	timecount: Number,
	slug: {type: Schema.Types.ObjectId, ref: 'Realm'},
	slugName: String,
	region: String,
	context: Number
})

auctionSchema.index({region:1,slugName:1,item:-1,buyoutPerItem:1})
auctionSchema.index({region:1,slugName:1,buyout:-1})
auctionSchema.index({region:1,slugName:1,timeLeft:1})

var auction = mongoose.model('auction', auctionSchema)
module.exports = auction