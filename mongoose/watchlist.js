var mongoose = require('mongoose')
var Schema = mongoose.Schema

var watchlistSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	item: {type: Number, ref: 'Item'},
	region: String,
	slug: String,
	maxBuyout: Number,
	maxBuyoutPerItem: Number,
	minQuantity: Number,
	isActive: Boolean,
	status: Number,
	isPet: Boolean,
	petSpecifics: {minLevel:Number,maxLevel:Number,breedId:Number,petId:Number},
	itemSpecifics: {}
})

var watchlist = mongoose.model('watchlist', watchlistSchema)
module.exports = watchlist