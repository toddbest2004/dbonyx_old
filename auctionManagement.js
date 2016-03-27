var fs = require("fs");
var request = require("request");
var db = require('./mongoose');
var async = require('async')
var transporter = require('./config/email.js')
var auctionlimit = process.env.AUCTION_LIMIT || 10 //this one limits how many auctions we'll load per run

var start = new Date()

var realmcount = 0; //counts how many auctions were loaded
var auctionConcurrency = 1;
var pauseInterval = 120000 //number of miliseconds to wait after an auctionimport

var auctionQueue = async.queue(function(task, callback){
	if(!task){
		setTimeout(callback, 5000)
	}else{
		importAuctionDataFromServer(task.body, task.slug, task.region, task.lastModified, callback)
	}
}, auctionConcurrency)

auctionQueue.drain = function(){
	auctionLog(realmcount+ " realms completed in "+(new Date()-start))
	if(realmcount>5){
		realmcount=0
		load_auction_data()
		start = new Date()
	}else{
		realmcount=0
		setTimeout(load_auction_data, pauseInterval)
		start = new Date()
	}
}

setTimeout(load_auction_data, 1000)
// var url = "https://"+region+".api.battle.net/wow/auction/data/dathremar?locale=en_US&apikey="+process.env.API
// checkServerForUpdatedAuctions(url, 'dathremar', 'us', 0,)

function load_auction_data(){
	db.realm.find({isMasterSlug:true}, null, {sort:{auctiontouch:1}}).then(function(realms){
		for(var i=0; i<auctionlimit;i++){			
			var slug = realms[i].slug
			var region = realms[i].region
			var touch = realms[i].auctiontouch
			var url = "https://"+region+".api.battle.net/wow/auction/data/"+slug+"?locale=en_US&apikey="+process.env.API
			auctionLog(url);
			checkServerForUpdatedAuctions(url, slug, region, touch,realms[i])
		}
	})

}

function checkServerForUpdatedAuctions(url, slug, region, touch, realm){
	auctionLog("Starting realm: "+slug)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			var lastModified = body.files[0].lastModified;
			if(lastModified>touch){
				realm.auctiontouch = lastModified
				realm.save()
				var task = {body:body.files[0].url,slug:slug,region:region,lastModified:lastModified/1000}
				auctionQueue.push(task, function(){realmcount++})
				// importAuctionDataFromServer(body.files[0].url, slug, region, lastModified)
				auctionLog(slug+": "+lastModified);
			}else{
				auctionLog(slug+": up to date.")
			}
		}else{
			auctionLog(response.statusCode||"No status code: "+slug)
		}
	});
}

function importAuctionDataFromServer(url, slug, region, touch,callback){
	auctionLog("Requesting auction data."+(new Date()-start))
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			auctionLog("Auction data recieved"+(new Date()-start))
			// writeAuctionDataToFile(body,slug,region,touch,callback)
			if(body.auctions){
				bulkImport(body, slug, region, touch, callback)
			}else{
				console.error("No auctions returned.")
				console.error("Body:")
				console.error(body)
				callback()
			}
		}else{
			auctionLog("Auction data error "+(new Date()-start))
			auctionLog("Response code: "+response.statusCode)
			auctionLog("Skipping")
			callback()
		}
	});
}

function bulkImport(auctionData, slug, region, touch, callback){
	auctionLog("Initializing bulk op. "+(new Date()-start))
	var bulkImport = db.auction.collection.initializeUnorderedBulkOp()
	if(auctionData&&auctionData.auctions&&auctionData.auctions.length){
		for(var i=0; i<auctionData.auctions.length;i++){
			var temp = auctionData.auctions[i]
			temp._id = temp.auc
			
			temp.bidPerItem = Math.round(temp.bid/temp.quantity)
			temp.buyoutPerItem = Math.round(temp.buyout/temp.quantity)
			temp.slugName = slug
			temp.region = region
			temp.touch = touch;
			temp.startTime = temp.timeLeft
			// temp.$setOnInsert={firstbid:temp.bid}
			// delete temp.auc
			// delete temp.ownerRealm
			auctionData.auctions[i] = temp
			// auctionLog(temp._id)
			bulkImport.insert(temp)//find({_id:temp._id}).upsert().updateOne(temp)
		}
		auctionLog(auctionData.auctions.length+" operations queued.")
		auctionLog(slug+": starting bluk import "+(new Date()-start))
		bulkImport.execute(function(err, data){
			// callback()
			removeOldAuctions(slug, region, touch, callback)
			// updateAuctionHistory(slug,region,touch,callback)
		})
	}else{
		auctionLog("No Auctions Found!")
		callback()
	}
}

function updateAuctionHistory(slug, region, touch, callback){
	var curDate = new Date()
	var dateString = curDate.getFullYear()+'-'+curDate.getMonth()+'-'+curDate.getDate()

	var bulkInsert = db.auctionhistory.collection.initializeUnorderedBulkOp()

	db.auction.find({region:region,slugName:slug,touch:{$lt:touch}}, function(err, oldAuctions){
		//note, cannot insert the auctionDirectly or an error will be thrown, must create a json object
		if(err||!oldAuctions||oldAuctions.length===0){
			removeOldAuctions(slug, region, touch, callback)
			return
		}
		for(var i=0;i<oldAuctions.length;i++){
			var expired=0
			var sold=0
			var sellingPrice=0
			if(oldAuctions[i].timeLeft==='VERY_SHORT'){
				//does not yet check for bid items
				// if(oldAuctions[i].firstbid===oldAuctions[i].bid){
					expired=oldAuctions[i].quantity
				// }else{
				// 	sold=oldAuctions[i].quantity
				// }
			}else{
				sold=oldAuctions[i].quantity
			}
			bulkInsert.find({slugName:slug,region:region,item:oldAuctions[i].item,date:dateString}).upsert().updateOne({
				$inc:{listed:oldAuctions[i].quantity,sold:sold,expired:expired,sellingPrice:sellingPrice}
			})
		}
		bulkInsert.execute(function(err,docs){
			if(err)
				auctionLog(err)
			auctionLog("Auction history completed in: "+(new Date()-start))
			removeOldAuctions(slug, region, touch, callback)
		})
	})
}

function removeOldAuctions(slug, region, touch, callback){
	auctionLog("Starting old auction removal."+(new Date()-start))
	db.auction.remove({region:region,slugName:slug,touch:{$lt:touch}}, function(err){
		if(err)
			auctionLog(err)
		auctionLog("Old auctions removed in "+(new Date()-start))
		checkWatchlists(slug, region, touch, callback)
	})
}

function checkWatchlists(slug, region, touch, callback){
	auctionLog("Starting Watchlist Check")
	db.watchlist.find({
		slug: slug,
		region: region,
		isActive: true
	}).populate('user').exec(function(err, lists){
		lists.forEach(function(list){
			db.auction.find({
				slugName:slug,
				region:region,
				item:list.item,
				quantity:{$lte:list.maxQuantity, $gte:list.minQuantity},
				buyoutPerItem:{$lte:list.maxBuyoutPerItem}
			}).populate('item').exec(function(err, aucs){
				if(!err&&aucs){
					notifyWatchlistUser(list, aucs)
				}
			})
		})
		auctionLog("Watchlist Check Finished")
		callback()
	})
}

function notifyWatchlistUser(list, auctions){
	if(list.user){
		console.log(list.user.email)
		var auctionMail = {
			from: 'mmofount@gmail.com',
			to: list.user.email,
			subject: 'DBOnyx: An item on your watchlist has been spotted on the Auction House',
			html: formMessage(auctions)
		}
		email(auctionMail)
		// console.log(testMail.html)
	}
	list.isActive = false
	list.save()
}

function formMessage(auctions){
	var message = "The following items have been spotted on the Auction House:"
	for(var i=0; i<auctions.length; i++){
		message += "<div>"+auctions[i].quantity+" "+auctions[i].item.name+" Price: "+auctions[i].buyout+"</div>"
	}

	return message
}

function email(message){
	transporter.sendMail(message, function(err, response){
		// res.json({username:req.body.username, email:req.body.email})
	})
}

function auctionLog(outputString){
	console.log(Date().toString() + ": "+outputString)
}