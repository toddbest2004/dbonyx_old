var express = require("express");
var router = express.Router();
var passport = require("passport")

var db = require("../../mongoose");

router.get('/categories',function(req, res){
	db.forumCategory.find({parentCategory:null}).populate('subCategories').sort({orderIndex:1}).exec(function(err, categories){
		res.json(categories)
	})
})

router.get('/category/:categoryId', function(req, res){
	db.forumCategory.findOne({_id:req.params.categoryId}).populate('threads').exec(function(err, cat){
		res.json(cat)
	})
	// db.forumThread.find({category:req.params.categoryId}).exec(function(err, threads){
	// 	res.json(threads)
	// })
})

router.get('/thread/:threadId', function(req,res){
	db.forumThread.findOne({_id:req.params.threadId}).populate({path:'posts category', populate: {path: 'author', select:'username'}}).exec(function(err, thread){
		res.json(thread)
	})
})

router.post("/thread/:threadId", function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			if(!user.isEmailValidated){
				return res.status(401).json({error:"You must validate your email before you can make a post."})
			}
			if(!req.body.message){
				return res.status(401).json({error:"You cannot post an empty message."})
			}
			db.forumThread.findOne({_id:req.params.threadId}).populate('posts').exec(function(err, thread){
				if(err||!thread){
					return res.status(401).json({error:"Error making post, please try again."})
				}
				db.forumPost.create({
					thread: thread,
					author: user,
					message: req.body.message
				}, function(err, post){
					if(err||!post){
						return res.status(401).json({error:"Error making post, please try again."})
					}
					thread.posts.push(post)
					thread.save(function(){
						res.json({result:"Success"})
					})
				})
			})
  		} else {
	  		return res.status(401).json({error:"You must be logged in to post a message."})
		}
	})(req, res)
})

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
			db.forumCategory.findOne({_id:req.params.categoryId}).populate('threads').exec(function(err, cat){
				if(err||!cat){
					return res.status(401).json({error:"Error making post, please try again."})
				}
				db.forumThread.create({
					name: req.body.title,
					category: cat
				},function(err, thread){
					if(err||!thread){
						return res.status(401).json({error:"Error making post, please try again."})
					}
					db.forumPost.create({
						thread: thread,
						author: user,
						message: req.body.message
					}, function(err, post){
						if(err||!post){
							return res.status(401).json({error:"Error making post, please try again."})
						}
						thread.posts.push(post)
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

module.exports = router