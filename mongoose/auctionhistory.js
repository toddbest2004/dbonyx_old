var mongoose = require('mongoose')
var Schema = mongoose.Schema

var auctionhistorySchema = new Schema({
	_id: Number,
	item: {type: Number, ref: 'item'},
	listed: Number,
	sold: Number,
	expired: Number,
	sellingPrice: Number,
	date: Date,
	slug: {type: Schema.Types.ObjectId, ref: 'Realm'},
	slugName: String,
	region: String,
	context: Number
})

auctionhistorySchema.index({region:1, slugName:1,item:-1,buyoutPerItem:1})

var auctionhistory = mongoose.model('auctionhistory', auctionhistorySchema)
module.exports = auctionhistory