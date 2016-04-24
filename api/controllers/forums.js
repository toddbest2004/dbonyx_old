var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

// router.get('/',function(req, res){
// 	res.send('test')
// })

// router.post('/test', function(req,res){
// 	db.onyxUser.findOne({username:'tester'}).exec(function(err, user){
// 		db.forumThread.findById('571c1790ca68b5bd12ea79cd')
// 		.populate('category')
// 		.exec(function(err, thread){
// 			db.forumPost.create({
// 				thread: thread,
// 				author: user,
// 				message: "This is another test message"
// 			},function(err, post){
// 				res.send(post)
// 			})
// 		})
// 	})
// })

module.exports = router