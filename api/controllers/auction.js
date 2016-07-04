'use strict';
//TODO: Currently, searchTerm.length must be>=3
//but there is no notification when it isn't
//need something to say "Hey, we're only using a search term 
//if it is at least three characters"

var express = require("express");
var router = express.Router();
var db = require("../../mongoose");

var itemConstants = require('./itemConstants');
var validComparators = {number:{'>':'$gt', '=':'$eq','<':'$lt'},boolean:{'True':true,'False':false}};
var validFilters = {
	'Item Level':{name:'itemLevel',type:'number'},
	'Required Level':{name:'requiredLevel',type:'number'},
	'Is Equippable':{name:'equippable',type:'boolean'}
	// 'Agility':{'bonusStats.stat':3}
};
var battlepetNames = {};
var realmArray = {};

db.battlepet.find({},function(err, battlepets){
	battlepets.forEach(function(pet){
		battlepetNames[pet._id]=pet.name;
	});
});

db.realm.find({}).populate('masterSlug').exec(function(err, realms){
	realms.forEach(function(realm){
		realmArray[realm.name.toLowerCase()]=realm.masterSlug.slug;
	});
});

router.get("/fetchauctions", function(req, res){
	var query = req.query;
	//default qualities to empty array if it is not sent
	if(!query.qualities)
		query.qualities=[];
	var searchTerm='';
	// var qualities=[];
	var filters={};
	var sort={};
	if(query.sortBy&&query.sortOrder){
		// console.log(query.sortBy, query.sortOrder)
		sort[query.sortBy]=parseInt(query.sortOrder);
	}
	if(!query.realm||typeof(query.realm)!=='string'){
		res.status(400).json({error:"Improper query string supplied."});
		return;
	}
	var realmSplit = query.realm.split('-');
	if(realmSplit.length!==2){
		res.status(400).json({error:"Improper query string supplied."});
		return;
	}
	
	var limit = parseInt(query.limit);
	var offset = parseInt(query.offset);
	if(limit>50){
		limit=50;
	}
	var region = realmSplit[1].toLowerCase();
	var realmName = realmSplit[0].toLowerCase();
	var slugName = realmArray[realmName]||false;
	if(!slugName){
		res.status(400).json({error:"Cannot find realm."});
		return;
	}
	var itemsFiltered = false;
	var itemQuery = db.item.find().select('_id');
	if(query.qualities&&query.qualities.length>0){
		filters.qualities=[];
		var myQualities = query.qualities;
		if(typeof(myQualities)==='object'){
			//qualities is an array with at least one item
			filters.qualities=myQualities.map(function(item){
				if(!isNaN(parseInt(item))){
					return parseInt(item);
				}
			}).filter(function(item){
				if(item||item===0){
					return true;
				}
			});
			itemsFiltered = true;
			itemQuery.where('quality').in(filters.qualities);
		}else{
			res.status(400).json({error:"Improper query string supplied."});
			return;
		}
	}
	if(query.searchTerm){
		if(typeof(query.searchTerm)!=='string'){
			res.status(400).json({error:"Improper query string supplied."});
			return;
		}
		if(query.searchTerm.length>2){
			searchTerm=query.searchTerm;
			itemsFiltered = true;
			var re = new RegExp(searchTerm,"i");
			itemQuery.regex('name',re);
		}
	}
	if(query.filters&&query.filters.length>0){
		if(typeof(query.filters)==='string'){
			processFilter(query.filters, itemQuery);
		}else{
			query.filters.forEach(function(filter){
				processFilter(filter,itemQuery);
			});
		}
		itemsFiltered=true;
	}
	if(itemsFiltered){
		itemQuery.exec(function(err, items){
			if(err||!items){
				res.status(400).json({error:"There was an error fetching data from the server."});
				return;
			}
			if(items.length===0){
				res.json({success:true, count:0, auctions:[], offset:offset, limit:limit});
				return;
			}
			var itemIds = items.map(function(item){
				return item._id;
			});
			auctionQuery(res, region, slugName, limit, offset, sort, itemIds);
		});
	}else{
		auctionQuery(res, region, slugName, limit, offset, sort, []);
	}
});

// //route for getting detailed statistics for a single item
// router.get('/item', function(req,res){
// 	var id = parseInt(req.query.id)
// 	if(!id)
// 		return res.status(400).json({error:"Improper query string supplied."})
// 	if(!req.query.realm||typeof(req.query.realm)!=='string'){
// 		res.status(400).json({error:"Improper query string supplied."})
// 		return
// 	}
// 	var realmSplit = req.query.realm.split('-')
// 	if(realmSplit.length!==2){
// 		res.status(400).json({error:"Improper query string supplied."})
// 		return
// 	}
// 	var region = realmSplit[1].toLowerCase()
// 	var realmName = realmSplit[0].toLowerCase()
// 	var masterSlug = realmArray[realmName]||false
// 	if(!masterSlug){
// 		res.status(400).json({error:"Cannot find realm."})
// 		return
// 	}
	
// 	db.auction.find({slugName:masterSlug,region:region,item:id,buyout:{'$gt':0}}).sort({buyoutPerItem:1}).limit(1).exec(function(err, auction){
// 		if(err)
// 			return res.status(400).json({error:"Error running query."})
// 		if(!auction.length)
// 			return res.json({})	
// 		db.auction.aggregate().match({slugName:masterSlug,region:region,item:id}).group({_id:'$item', totalItemCount:{'$sum':'$quantity'},totalPrice:{'$sum':'$buyout'}, auctionCount:{'$sum':1}}).exec(function(err, aggregateData){
// 			if(err)
// 				return res.status(400).json({error:"Error running query."})
// 			var results = {aggregate:aggregateData[0], low:auction[0]}
// 			res.json(results)
// 		})
// 	})

// })

router.get("/auctionHistory", function(req, res){
	var query = req.query;
	// console.log(req.query.realm)
	if(!query.item){
		res.status(400).json({error:"Improper query string supplied."});
		return;
	}
	if(!query.realm||typeof(query.realm)!=='string'){
		res.status(400).json({error:"Improper query string supplied."});
		return;
	}
	var realmSplit = query.realm.split('-');
	if(realmSplit.length!==2){
		res.status(400).json({error:"Improper query string supplied."});
		return;
	}
	var item = parseInt(query.item);
	var region = realmSplit[1].toLowerCase();
	var realmName = realmSplit[0].toLowerCase();
	var masterSlug = realmArray[realmName]||false;
	if(!masterSlug){
		res.status(400).json({error:"Cannot find realm."});
		return;
	}
	db.auctionhistory.find({slugName:masterSlug,region:region,item:item}).exec(function(err, data){
		if(err) return res.json({error:"Error executing query."});
		var min=9999999999999999,max=0,maxQuantity=0;
		for(var i=0;i<data.length;i++){
			data[i].sold = data[i].sold||0;
			data[i].expired = data[i].expired||0;
			//ternary check to skip if sold is 0
			min = Math.min(min, data[i].sold?parseInt(data[i].sellingPrice/data[i].sold):min);
			max = Math.max(max, data[i].sold?parseInt(data[i].sellingPrice/data[i].sold):max);
			maxQuantity = Math.max(maxQuantity, data[i].sold+data[i].expired);
		}
		res.json({min:min,max:max,maxQuantity:maxQuantity,histories:data});
	});
});

router.get("/*", function(req, res){
	res.status(404).json({error:"Not Found.", result:false});
});

module.exports = router;


// function parseFilters(filters){
// 	var parsedFilters = {};
// 	for(var i=0;i<filters.length;i++){
// 		try{
// 			var filter = JSON.parse(filters[i]);
// 		}catch(er){
// 			console.log(er);
// 			return {error:true};
// 		}
// 	}
// 	return parsedFilters;
// }

function auctionQuery(res, region, slugName, limit, offset, sort, filteredItems){
	var auctionQuery = db.auction.find({region:region,slugName:slugName});
	auctionQuery.populate({path:'item'}).sort(sort).skip(offset).limit(limit);
	if(filteredItems.length>0){
		auctionQuery.where('item').in(filteredItems);
	}
	auctionQuery.lean().exec(function(err, auctions){
		auctionQuery.limit(0).skip(0).count(function(err, count){
			auctions.map(function(auction){
				auction.item=auction.item||{name:"Unknown Item",_id:0,itemId:0};
				if(auction.rand){
					auction.item.suffix=itemConstants.randIds[auction.rand]?itemConstants.randIds[auction.rand].suffix:" of unknown Enchant";
				}
				for(var key in auction){
					// console.log(key);
					if(key!=='item'&&key!=='_id'){
						auction.item[key]=auction[key];
					}
				}
				if(auction.item._id===82800){
					auction.item.modifiers.forEach(function(modifier){
						if(modifier.type===3){
							auction.item.name="Cage: "+battlepetNames[modifier.value];
						}
					});
					auction.item.quality=auction.item.petQualityId;
				}
				return auction;
			});
			res.json({success:true, count:count, auctions:auctions, offset:offset, limit:limit});
		});
	});
}

function processFilter(filter, itemQuery){
	var tmpFilter;
	try{
		tmpFilter = JSON.parse(filter);
	}catch(err){
		return;
	}
	if(typeof(tmpFilter.type)!=='string'){
		return;
	}
	var filterData = validFilters[tmpFilter.type];
	if(filterData){
		if(filterData.type==='number'){
			processNumberFilter(filterData,tmpFilter,itemQuery);
		}else if(filterData.type==='boolean'){
			processBooleanFilter(filterData,tmpFilter,itemQuery);
		}
	}	
	return;
}

function processNumberFilter(filterData,tmpFilter,itemQuery){
	var comparatorType = validComparators.number[tmpFilter.comparator];
	var tmpWhere={};
	tmpWhere[filterData.name]={};
	if(comparatorType){
		if(typeof(tmpFilter.value)==='string'||typeof(tmpFilter.value)==='number'){
			tmpWhere[filterData.name][comparatorType]=parseInt(tmpFilter.value);
			itemQuery.where(tmpWhere);
			console.log(tmpWhere);
			// itemQuery.where({'bonusStats.stat':4,'bonusStats.amount':{$lte:10}})
			// itemQuery.where({'bonusStats.amount':{$lte:10}})
			// itemQuery.populate({path:'bonusStat', match:{stat:4,amount:{$lte:10}}})
		}
	}
}

function processBooleanFilter(filterData,tmpFilter,itemQuery){
	var tmpWhere={};
	if(typeof(validComparators.boolean[tmpFilter.comparator])==='boolean'){
		tmpWhere[filterData.name]=validComparators.boolean[tmpFilter.comparator];
		itemQuery.where(tmpWhere);
	}
	// if(typeof(validComparators.number[tmpFilter.comparator])){

	// }
}