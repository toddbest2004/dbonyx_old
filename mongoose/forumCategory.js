var mongoose = require('mongoose')
var Schema = mongoose.Schema

var forumCategorySchema = new Schema({
	parentCategory: {type: Schema.Types.ObjectId, ref: 'forumCategory'},
	subCategories: [{type: Schema.Types.ObjectId, ref: 'forumCategory'}],
	threads: [{type: Schema.Types.ObjectId, ref: 'forumThread'}],
	name: String,
	orderIndex: Number, //order that that categories should be displayed under parent
})


var forumCategory = mongoose.model('forumCategory', forumCategorySchema)
module.exports = forumCategory