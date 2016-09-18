"use strict";
var db = require('./mongoose');

setTimeout(updateForums, 2000);

function updateForums() {
	db.forumPost.find({}, function(err, posts) {
		posts.forEach(function(post) {
			if(!post.parsedContent) {
				post.parsedContent = post.message;
				post.save();
				console.log("saved");
			}
		});
	});
}