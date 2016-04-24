var express = require("express");
var router = express.Router();

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

// router.post('/test', function(req,res){
// 	db.onyxUser.findOne({username:'tester'}).exec(function(err, user){
// 		db.forumCategory.findOne({name: 'Sub Category 2',}).exec(function(err, cat){
// 			db.forumThread.findOne({
// 				name: 'First Thread',
// 			}, function(err, thread){
// 				db.forumPost.create({
// 					author:user,
// 					thread: thread,
// 					message: "this is message 2"
// 				}, function(err, post){
// 					res.json(post)
// 				})
// 			})
// 		})
// 	})
// })

// router.post('/test', function(req, res){
// 	db.forumThread.find().populate('category').exec(function(err, threads){
// 		threads.forEach(function(thread){
// 			if(thread.category.threads.indexOf(thread._id)===-1){
// 				thread.category.threads.push(thread)
// 				thread.category.save()
// 			}

// 		})
// 		res.send(threads[0].category)
// 	})
// })

module.exports = router