var mongoose = require('mongoose')
var Schema = mongoose.Schema

var auctionhistorySchema = new Schema({
	_id: Number,
	item: {type: Number, ref: 'item'},
	slugName: String,
	region: String,
	histories: {},
	listed: Number,
	sold: Number,
	expired: Number,
	sellingPrice: Number,
	date: Date,
	slug: {type: Schema.Types.ObjectId, ref: 'Realm'},
	context: Number
})

auctionhistorySchema.index({region:1,slugName:1,date:1,item:-1})

var auctionhistory = mongoose.model('auctionhistory', auctionhistorySchema)
module.exports = auctionhistory