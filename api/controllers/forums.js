'use strict';
var express = require("express");
var router = express.Router();
var passport = require("passport");

var peg = require("pegjs"); //parser module
var parser = require("../parsers/forum.js");
// console.log(parser)
var db = require("../../mongoose");

router.post("/preview", function(req, res) {
	var preview = req.body.message;
	preview = parseMessage(preview);
	res.json({preview: preview});
});

router.get('/categories',function(req, res){
	db.forumCategory.find({parentCategory:null}).populate('subCategories').sort({orderIndex:1}).exec(function(err, categories){
		res.json(categories);
	});
});

router.get('/category/:categoryId', function(req, res){
	db.forumCategory.findOne({_id:req.params.categoryId}).populate({path: 'threads', populate:[{path:'startedBy', model:'onyxUser', select:'username'},{path:'posts', model:'forumPost'}]}).exec(function(err, cat){
		res.json(cat);
	});
	// db.forumThread.find({category:req.params.categoryId}).exec(function(err, threads){
	// 	res.json(threads)
	// })
});

router.get('/thread/:threadId', function(req,res){
	db.forumThread.findOne({_id:req.params.threadId}).populate({path:'posts category', populate: {path: 'author', select:'username'}}).exec(function(err, thread){
		res.json(thread);
	});
});

router.get('/sitenews', function(req,res){
	db.forumCategory.findOne({name:'Front Page News'}).populate({path: 'threads',options:{sort:{'firstPostTime':-1},limit:5}, populate:[{path:'startedBy', model:'onyxUser', select:'username'},{path:'posts', model:'forumPost', options:{limit:50}}]}).exec(function(err, cat){
		res.json(cat);
	});
});

//create post in thread (reply to thread)
router.post("/thread/:threadId", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			if(!user.isEmailValidated){
				return res.status(401).json({error:"You must validate your email before you can make a post."});
			}
			//if(!user.has permissions)
			//
			if(!req.body.message){
				return res.status(401).json({error:"You cannot post an empty message."});
			}
			var parsedContent = parseMessage(req.body.message);
			db.forumThread.findOne({_id:req.params.threadId}).populate('posts').exec(function(err, thread){
				if(err||!thread){
					return res.status(401).json({error:"Error making post, please try again."});
				}
				db.forumPost.create({
					thread: thread,
					author: user,
					message: req.body.message,
					parsedContent: parsedContent
				}, function(err, post){
					if(err||!post){
						return res.status(401).json({error:"Error making post, please try again."});
					}
					thread.posts.push(post);
					thread.lastPost = post;
					thread.save(function() {
						res.json({result:"Success"});
					});
				});
			});
  		} else {
	  		return res.status(401).json({error:"You must be logged in to post a message."});
		}
	})(req, res);
});

//create new thread in category
router.post("/category/:categoryId", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			if(!user.isEmailValidated){
				return res.status(401).json({error:"You must validate your email before you can make a post."})
			}
			if(!req.body.message){
				return res.status(401).json({error:"You cannot post an empty message."})
			}
			if(!req.body.title){
				return res.status(401).json({error:"You must provide a title for your post."})
			}
			var title = req.body.title
			var message = req.body.message
			var parsedContent = parseMessage(message);
			db.forumCategory.findOne({_id:req.params.categoryId}).populate('threads').exec(function(err, cat){
				if(err||!cat){
					return res.status(401).json({error:"Error making post, please try again."})
				}
				if(cat.permissions.createThread.indexOf(user.userLevel)===-1){
					return res.status(401).json({error:"You do not have the permissions to create a thread in this forum."})
				}
				db.forumThread.create({
					name: title,
					category: cat,
					startedBy: user
				},function(err, thread){
					if(err||!thread){
						return res.status(401).json({error:"Error making post, please try again."})
					}
					db.forumPost.create({
						thread: thread,
						author: user,
						message: message,
						parsedContent: parsedContent
					}, function(err, post){
						if(err||!post){
							return res.status(401).json({error:"Error making post, please try again."})
						}
						thread.posts.push(post)
						thread.lastPost = post
						thread.save(function(){
							cat.threads.push(thread)
							cat.save(function(){
								res.json({result:"Success"})
							})
						})
					})
				})
			})
  		} else {
	  		return res.status(401).json({error:"You must be logged in to post a message."})
		}
	})(req, res)
})

router.post('/category', function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if(err||!user){
			return res.status(401).json({error:"You must be logged in to create a category."})	
		}
		if(user.userLevel!==1){
			return res.status(401).json({error:"You do not have permission to create a category"})
		}
		if(!req.body||!req.body.name){
			return res.status(400).json({error:"You must give the category a name."})
		}
		db.forumCategory.create({
			name: req.body.name,
			parentCategory: null,
			subCategories: [],
			threads: [],
			permissions: {
				createThread: [0,1],
				createPost: [0,1]
			}
		}, function(err, cat){
			if(err||!cat){
				return res.status(500).json({error:"There was an error creating new category"})
			}
			return res.json({result: 'success'})
		})
	})(req, res)
})

router.post('/subcategory', function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if(err||!user){
			return res.status(401).json({error:"You must be logged in to create a category."})	
		}
		if(user.userLevel!==1){
			return res.status(401).json({error:"You do not have permission to create a category"})
		}
		if(!req.body||!req.body.name||typeof(req.body.name)!=='string'){
			return res.status(400).json({error:"You must give the category a name."})
		}
		if(!req.body.id||typeof(req.body.id)!=='string'){
			return res.status(400).json({error:"You must specify parent category's id."})
		}
		db.forumCategory.findOne({
			_id:req.body.id
		}).exec(function(err, parent){
			if(err||!parent){
				return res.status(500).json({error:"There was an error creating new category"})
			}
			db.forumCategory.create({
				name: req.body.name,
				parentCategory: parent,
				subCategories: [],
				threads: [],
				permissions: {
					createThread: [0,1],
					createPost: [0,1]
				}
			}, function(err, cat){
				if(err||!cat){
					return res.status(500).json({error:"There was an error creating new category"})
				}
				parent.subCategories.push(cat)
				parent.save(function(){
					return res.json({result: 'success'})
				})
			})
		})
	})(req, res)
})

//edit existing post
router.post("/post/:id", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		var postId = req.params.id
		var postText = req.body.text
		db.forumPost.findOne({_id:postId}).exec(function(err, post){
			if(err||!post){
				return res.status(404).json({error:"Unable to find post, please make sure it exists."})
			}
			if(post.author.toString()!==user._id.toString()&&user.userLevel!==1){
				return res.status(400).json({error:"You do not have permission to edit this post."})
			}
			post.message = postText
			post.editCount++
			post.lastEditedOn = Date.now()
			post.lastEditedBy = user
			post.save(function(err){
				if(err)
					console.log(err)
				res.json({result:"success"})
			})
		})

	})(req, res)
})

module.exports = router

function parseMessage(message) {
	message = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	message = parser.parse(message);
	return message;
}