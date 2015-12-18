var mongoose = require('mongoose')
var Schema = mongoose.Schema

var realmSchema = new Schema({
    region: String,
    name: String,
    slug: String,
    masterSlug: {type: Schema.Types.ObjectId, ref: 'Realm'},
    isMasterSlug: Boolean,
    connectedRealms: [{type: Schema.Types.ObjectId, ref: 'Realm'}],
    auctiontouch: Number,
    type: String,
    population: String,
    battlegroup: String,
    locale: String,
    timezone: String,
    queue: String,
    wintergraspFaction: Number,
    wintergraspStatus: Number,
    wintergraspNext: Number,
    tolbaradFaction: Number,
    tolbaradStatus: Number,
    tolbaradNext: Number
})

realmSchema.index({region:1, slug:1}, {unique:true})

var realm = mongoose.model('realm', realmSchema)
module.exports = realm