//TODO: Currently, searchTerm.length must be>=3
//but there is no notification when it isn't
//need something to say "Hey, we're only using a search term 
//if it is at least three characters"

var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/fetchauctions", function(req, res){
	var query = req.query
	var searchTerm=''
	var qualities=[]
	var filters={}
	var sort={}
	if(query.sortBy&&query.sortOrder){
		console.log(query.sortBy, query.sortOrder)
		sort[query.sortBy]=parseInt(query.sortOrder)
	}
	if(query.filters&&query.filters.length>0){
		query.filters=JSON.parse(query.filters)
		console.log(query.filters)
		if(query.filters.qualities&&query.filters.qualities.length>0){
			filters.qualities=[]
			var myQualities = query.filters.qualities
			if(typeof(myQualities)==='string'){
				if(!isNaN(parseInt(myQualities))){
					filters.qualities.push(parseInt(myQualities))
				}else{
					res.status(400).json({error:"Improper query string supplied."})
					return	
				}
			}else if(typeof(myQualities)==='object'){
				//qualities is an array with at least one item
				filters.qualities=myQualities.map(function(item){
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
	}
	if(query.searchTerm){
		if(typeof(query.searchTerm)!=='string'){
			res.status(400).json({error:"Improper query string supplied."})
			return
		}
		if(query.searchTerm.length>2)
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
		if(filters.qualities){
			itemsFiltered = true
			itemQuery.where('quality').in(filters.qualities)
			console.log("asdf")
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
				auctionQuery(res, region, slugName, limit, offset, sort, itemIds)
			})
		}else{
			auctionQuery(res, region, slugName, limit, offset, sort, [])
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

function auctionQuery(res, region, slugName, limit, offset, sort, filteredItems){
		var auctionQuery = db.auction.find({region:region,slugName:slugName})
		auctionQuery.populate({path:'item'}).skip(offset).sort(sort).limit(limit)
		if(filteredItems.length>0){
			auctionQuery.where('item').in(filteredItems)
		}
		auctionQuery.exec(function(err, auctions){
			auctionQuery.limit(0).skip(0).count(function(err, count){
				res.json({success:true, count:count, auctions:auctions, offset:offset, limit:limit})
			})
		})
}