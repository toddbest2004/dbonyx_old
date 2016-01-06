var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/fetchauctions", function(req, res){
	var query = req.query
	if(!query.region||!query.realm||typeof(query.region)!=='string'||typeof(query.realm)!=='string'){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	var region = query.region
	var slugName = query.realm
	var limit = 5
	var offset = 0

	var query = db.auction.find({region:region,slugName:slugName}).skip(offset).limit(limit)
	//query.populate('item', )
	query.exec(function(err, auctions){
		query.count(function(err, count){
			res.json({success:true, count:count, auctions:auctions, offset:offset, limit:limit})
		})
	})
})

router.get("/*", function(req, res){
	res.status(404).json({error:"Not Found.", result:false})
})

module.exports = router


function parseFilters(filters){
	var parsedFilters = {}
	for(var i=0;i<filters.length;i++){
		try{
			var filter = JSON.parse(filters[i])
		}catch(er){
			console.log(er)
			return {error:true}
		}

	}
	console.log(filters)
	return parsedFilters
}