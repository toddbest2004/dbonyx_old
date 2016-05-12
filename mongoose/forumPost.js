var mongoose = require('mongoose')
var Schema = mongoose.Schema

var forumPostSchema = new Schema({
	thread: {type: Schema.Types.ObjectId, ref: 'forumThread'},
	author: {type: Schema.Types.ObjectId, ref: 'onyxUser'},
	message: String,
	createdOn: {type: Date, default: Date.now},
	lastEditedBy: {type: Schema.Types.ObjectId, ref: 'onyxUser'},
	lastEditedOn: Date,
	editCount: {type: Number, default: 0},
	// flags: [{}],
	flagCount: {type: Number, default: 0},
	hidden: {type: Boolean, default: false},
	deleted: {type: Boolean, default: false},
})


var forumPost = mongoose.model('forumPost', forumPostSchema)
module.exports = forumPost
