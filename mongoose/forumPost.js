var mongoose = require('mongoose')
var Schema = mongoose.Schema

var forumPostSchema = new Schema({
	thread: {type: Schema.Types.ObjectId, ref: 'forumThread'},
	author: {type: Schema.Types.ObjectId, ref: 'user'},
	message: String,
	createdOn: {type: Date, default: Date.now},
	lastEditedBy: {type: Schema.Types.ObjectId, ref: 'user'},
	lastEditedOn: Date,
	isEdited: {type: Boolean, default: false},
	// flags: [{}],
	flagCount: {type: Number, default: 0},
	hidden: {type: Boolean, default: false},
	deleted: {type: Boolean, default: false},
})


var forumPost = mongoose.model('forumPost', forumPostSchema)
module.exports = forumPost
