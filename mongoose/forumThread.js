var mongoose = require('mongoose')
var Schema = mongoose.Schema

var forumThreadSchema = new Schema({
	category: {type: Schema.Types.ObjectId, ref: 'forumCategory'},
	name: String,
	posts: [{type: Schema.Types.ObjectId, ref: 'forumPost'}],
	stickied: {type: Boolean, default: false},
	// stickyId: Number, //For ordering stickied posts outside of date
	locked: {type: Boolean, default: false},
	important: {type: Boolean, default: false},
	firstPostTime: {type: Date, default: Date.now},
	// lastPost: {type: Schema.Types.ObjectId, ref:'forumPost'},
	watchedBy: [{type: Schema.Types.ObjectId, ref:'user'}],
	startedBy: {type: Schema.Types.ObjectId, ref: 'user'},
})


var forumThread = mongoose.model('forumThread', forumThreadSchema)
module.exports = forumThread