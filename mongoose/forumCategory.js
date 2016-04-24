var mongoose = require('mongoose')
var Schema = mongoose.Schema

var forumCategorySchema = new Schema({
	parentCategory: {type: Schema.Types.ObjectId, ref: 'forumCategory'},
	subCategories: [{type: Schema.Types.ObjectId, ref: 'forumCategory'}],
	name: String,
	orderIndex: Number, //order that that categories should be displayed under parent
	categoryId: {type:Number, unique: true}, //id to reference from website (instead of _id)
})


var forumCategory = mongoose.model('forumCategory', forumCategorySchema)
module.exports = forumCategory