var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/fetchauctions", function(req, res){
	var query = req.query
	var searchTerm=''
	var qualities=[]
	if(query.qualities){
		if(typeof(query.qualities)==='string'){
			if(!isNaN(parseInt(query.qualities))){
				qualities.push(parseInt(query.qualities))
			}else{
				res.status(400).json({error:"Improper query string supplied."})
				return	
			}
		}else if(typeof(query.qualities)==='object'&&query.qualities.length>0){
			//qualities is an array with at least one item
			qualities=query.qualities.map(function(item){
				if(!isNaN(parseInt(item))){
					return parseInt(item)
				}
			}).filter(function(item){
				if(item||item===0){
					return true
				}
			})
		}else{
			res.status(400).json({error:"Improper query string supplied."})
			return			
		}
	}
	if(query.searchTerm){
		if(typeof(query.searchTerm)!=='string'){
			res.status(400).json({error:"Improper query string supplied."})
			return
		}
		searchTerm=query.searchTerm
	}
	if(!query.realm||typeof(query.realm)!=='string'){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	var realmSplit = query.realm.split('-')
	if(realmSplit.length!==2){
		res.status(400).json({error:"Improper query string supplied."})
		return
	}
	
	var region = realmSplit[1].toLowerCase()
	var realmName = realmSplit[0]
	var limit = parseInt(query.limit)
	var offset = parseInt(query.offset)
	if(limit>50){
		limit=50
	}

	db.realm.findOne({name:realmName}).populate('masterSlug').exec(function(err, realm){
		var slugName = realm.masterSlug.slug
		var itemsFiltered = false
		var itemQuery = db.item.find().select('_id')
		if(qualities.length>0){
			itemsFiltered = true
			itemQuery.where('quality').in(qualities)
		}
		if(searchTerm){
			itemsFiltered = true
			var re = new RegExp(searchTerm,"i")
			itemQuery.regex('name',re)
		}
		if(itemsFiltered){
			itemQuery.exec(function(err, items){
				if(err||!items){
					res.status(400).json({error:"There was an error fetching data from the server."})
					return
				}
				if(items.length===0){
					res.json({success:true, count:0, auctions:[], offset:offset, limit:limit})
					return
				}
				var itemIds = items.map(function(item){
					return item._id
				})
				auctionQuery(res, region, slugName, limit, offset, itemIds)
			})
		}else{
			auctionQuery(res, region, slugName, limit, offset, [])
		}
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
	return parsedFilters
}

function auctionQuery(res, region, slugName, limit, offset, filteredItems){
		var auctionQuery = db.auction.find({region:region,slugName:slugName})
		//query.populate('item', )
		auctionQuery.populate('item').skip(offset).limit(limit)
		if(filteredItems.length>0){
			auctionQuery.where('item').in(filteredItems)
		}
		auctionQuery.exec(function(err, auctions){
			auctionQuery.limit(0).skip(0).count(function(err, count){
				res.json({success:true, count:count, auctions:auctions, offset:offset, limit:limit})
			})
		})
}