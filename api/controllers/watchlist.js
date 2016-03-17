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
	console.log(req.body)
	var query = req.body
	if(!req.user){
		res.status(403).json({error:"You must be logged in."})
		return
	}
	// if(!req.user.isEmailValidated){
	// 	res.status(403).json({error:"You must authenticate your email before you can create a watchlist."})
	// 	return
	// }
	var itemId
	if(!query.item||!(itemId=parseInt(query.item))){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	var realmSplit = query.realm.split('-')
	if(realmSplit.length!==2){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	if(!query.realm||typeof(query.realm)!=='string'){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	if(!query.price){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	var min = parseInt(query.min)||1
	var max = parseInt(query.max)||9999
	var price = parseInt(query.price)||1
	var region = realmSplit[1].toLowerCase()
	var realmName = realmSplit[0]
	db.realm.findOne({name:realmName}).populate('masterSlug').exec(function(err, realm){
		if(err||!realm){
			res.status(400).json({error:"Unable to find realm in database."})
			return
		}
		var slugName = realm.masterSlug.slug
		db.item.findOne({_id:itemId}).exec(function(err, item){
			if(err||!item){
				res.status(400).json({error:"Unable to find item in database."})
				return
			}
			db.watchlist.create({
				item:itemId,
				maxBuyoutPerItem:price,
				slug:slugName,
				region:region,
				user:req.user._id,
				minQuantity:min,
				maxQuantity:max,
				isActive:true
			}, function(err, watchlist){
				if(err||!watchlist){
					res.status(400).json({error:"Error saving watchlist to database."})
					return
				}
				res.json({result:'success'})
			})
		})
	})
})

module.exports = router