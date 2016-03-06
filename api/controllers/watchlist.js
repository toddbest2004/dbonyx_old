var express = require("express");
var router = express.Router();
var db = require('../../mongoose')

//get all
router.get("/", function(req,res){
	if(!req.user){
		res.status(403).json({error:"You must be logged in."})
		return
	}
	db.watchlist.find({user:req.user._id}).exec(function(err, watchlists){
		console.log(watchlists)
	})
	res.json({test:'test'})
})

//add route
router.post("/", function(req,res){
	if(!req.user){
		res.status(403).json({error:"You must be logged in."})
		return
	}

	res.json({result:'success'})
})

module.exports = router