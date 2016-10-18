"use strict";
var request = require("request");
// var db = require('./mongoose');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});
var async = require('async');
var transporter = require('./config/email.js');
var auctionlimit = process.env.AUCTION_LIMIT || 2; //this one limits how many auctions we'll load per run

var start = new Date();
var loadTimer = new Date();


var realmcount = 0; //counts how many auctions were loaded
var auctionConcurrency = 1;
var pauseInterval = 120000; //number of miliseconds to wait after an auctionimport
var daysToRetain = 10;
var lastPurge = 0;

var auctionQueue = async.queue(function(task, callback){
	loadTimer = new Date();
	if(!task){
		setTimeout(callback, 5000);
	}else{
		importAuctionDataFromServer(task.body, task.slug, task.slugId, task.region, task.lastModified, callback);
	}
}, auctionConcurrency);

auctionQueue.drain = function(){
	console.log("DRAIN");
	auctionLog(realmcount+ " realms completed in "+(new Date()-start));
	console.log("________");
	if(realmcount>5){
		realmcount=0;
		load_auction_data();
		start = new Date();
	}else{
		realmcount=0;
		setTimeout(load_auction_data, pauseInterval);
		start = new Date();
	}
}

setTimeout(load_auction_data, 1000);
// var url = "https://"+region+".api.battle.net/wow/auction/data/dathremar?locale=en_US&apikey="+process.env.API
// checkServerForUpdatedAuctions(url, 'dathremar', 'us', 0,)

function load_auction_data(){
	connection.query("SELECT * FROM realms WHERE isMasterSlug = TRUE ORDER BY auctiontouch ASC LIMIT "+auctionlimit,  function(err, realms) {
		for(var i=0; i<realms.length; i++) {
			var slug = realms[i].slug,
				slugId = realms[i].id,
				region = realms[i].region,
				touch = realms[i].auctiontouch,
				url = "https://"+region+".api.battle.net/wow/auction/data/"+slug+"?locale=en_US&apikey="+process.env.API;
			checkServerForUpdatedAuctions(url, slug, slugId, region, touch, realms[i]);
		}
	});
}

function checkServerForUpdatedAuctions(url, slug, slugId, region, touch, realm){
	auctionLog("Starting realm: "+slug)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			var lastModified = body.files[0].lastModified;
			if(lastModified>touch){
				// realm.auctiontouch = lastModified;
				// realm.save();
				var task = {body:body.files[0].url,slugId:slugId, slug:slug,region:region,lastModified:lastModified/1000};
				auctionQueue.push(task, function(){realmcount++;});
				// importAuctionDataFromServer(body.files[0].url, slug, region, lastModified)
				auctionLog(slug+": "+lastModified);
			}else{
				console.log(touch, lastModified);
				auctionQueue.push(false, function(){auctionLog(slug+": up to date.")})
			}
		}else{
			auctionQueue.push(false, function(){auctionLog("No status code: "+slug)})
		}
	});
}

function importAuctionDataFromServer(url, slug, slugId, region, touch,callback){
	auctionLog("Requesting auction data."+(new Date()-start))
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			auctionLog("Auction data recieved"+(new Date()-start));
			// writeAuctionDataToFile(body,slug,region,touch,callback)
			if(body.auctions){
				console.log(body.auctions.length);
				bulkImport(body, slug, slugId, region, touch, callback);
			}else{
				callback();
			}
		}else{
			auctionLog("Auction data error "+(new Date()-start));
			auctionLog("Response code: ");
			auctionLog("Skipping");
			callback();
		}
	});
}

function bulkImport(auctionData, slug, slugId, region, touch, callback){
	auctionLog("Initializing bulk op. "+(new Date()-start));
	if (auctionData&&auctionData.auctions&&auctionData.auctions.length) {
		auctionLog(slug+": starting bluk import "+(new Date()-start));
		var queryData = [];
		auctionData.auctions.forEach(function(auction, idx) {
			queryData.push([
				auction.auc,
				slugId,
				auction.item,
				auction.owner,
				auction.ownerRealm,
				auction.bid, //firstbid
				auction.bid, //currentbid
				auction.buyout,
				Math.round(auction.bid/auction.quantity),
				Math.round(auction.buyout/auction.quantity),
				auction.quantity,
				auction.timeLeft,
				auction.rand,
				auction.seed,
				auction.context,
				touch,
				1 //timecount starts at 1;
			]);
			if(idx%10000 === 9999) {
				performBulkInsert(queryData);
				queryData = [];
			}
		});
		performBulkInsert(queryData, true, slug, slugId, touch, callback);
	}else{
		auctionLog("No Auctions Found!");
		callback();
	}
}

function performBulkInsert(queryData, isLast, slug, slugId, touch, callback) {
	connection.query("INSERT INTO auctions (id, slug_id, item_id, owner, ownerRealm, firstbid, bid, buyout, bidPerItem, buyoutPerItem, quantity, timeLeft, rand, seed, context, touch, timecount) VALUES ? ON DUPLICATE KEY UPDATE bid = VALUES(bid), timecount=timecount+1, bidPerItem = VALUES(bidPerItem), touch=VALUES(touch)", [queryData], function(err, res) {
		auctionLog("Packet done.");
		if (isLast) {
			countSold(slugId, touch, callback);
		}
	})
}

//Rough draft of auction histories
//Currently assumes any auction listed as "SHORT" is expired
//All other auctions are considered 'sold'
//Does not check time between imports, so if it misses an hour
//will cause some errors in reporting sold/expired items.
function countSold(slugId, touch, callback) {
	auctionLog("Finding sold auctions");
	connection.query("SELECT SUM(quantity) AS totalQuantity, SUM(buyout) AS totalBuyout, item_id FROM auctions WHERE slug_id = ? AND touch < ? AND timeleft <> 'SHORT' GROUP BY item_id;", [slugId, touch], function(err, res) {
		var now = new Date(touch*1000);
		var queryData = [];
		var soldData = {};
		auctionLog("Preparing sold auction update query.");
		res.forEach(function(sold) {
			soldData[sold.item_id] = sold.totalQuantity;
			queryData.push([sold.item_id, slugId, now, sold.totalQuantity, sold.totalBuyout]);
		});
		auctionLog("Running sold auction update query...");
		connection.query("INSERT INTO auctionHistories (item_id, slug_id, date, sold, totalSellPrice) values ? ON DUPLICATE KEY UPDATE sold = sold + VALUES(sold), totalSellPrice = totalSellPrice + VALUES(totalSellPrice);", [queryData], function(err, res) {
			auctionLog("Done");
			countExpired(slugId, touch, soldData, callback);
		});
	});
}

function countExpired(slugId, touch, soldData, callback) {
	// console.log(soldData)
	var now = new Date(touch*1000);
	var queryData = [];
	connection.query("SELECT SUM(quantity) AS totalQuantity, item_id FROM auctions WHERE slug_id = ? AND touch < ? GROUP BY item_id;", [slugId, touch], function(err, res) {
		res.forEach(function(sold) {
			if(!soldData[sold.item_id]) {
				soldData[sold.item_id]=0;
			}
			queryData.push([sold.item_id, slugId, sold.totalQuantity-soldData[sold.item_id]]);
		});
		auctionLog("Updating expired auctions count...");
		connection.query("INSERT INTO auctionHistories (item_id, slug_id, date, expired) values ? ON DUPLICATE KEY UPDATE expired = expired + VALUES(expired)", queryData, function(err, res) {
			auctionLog("Done.");
			removeOldAuctions(slugId, touch, callback);
		});
	});
}

function removeOldAuctions(slugId, touch, callback){
	auctionLog("Starting old auction removal...");
	connection.query("DELETE FROM auctions WHERE slug_id = ? AND touch < ?;",[slugId, touch], function(err, res) {
		auctionLog("Done.");
		removeOldAuctionHistories();
		checkWatchlists(slugId);
		updateAuctionTouch(slugId, touch, callback);
	});
}

function removeOldAuctionHistories(slug, region, touch, callback) {
	if (Date.now()-lastPurge>1000*60*60*24) { //one day for purge
		lastPurge = Date.now();
		// var today = new Date()
		// var oldDate = new Date(new Date().setDate(today.getDate()-daysToRetain))

		// db.auctionhistory.remove({date:{$lt:oldDate}}).exec(function(err, data){
		// 	auctionLog(data.result.n +" auction histories removed.")
		// 	checkWatchlists(slug, region, touch, callback)
		// })
	}
}

function updateAuctionTouch(slugId, touch, callback) {
	auctionLog("Updating realm timestamp.");
	connection.query("UPDATE realms SET auctiontouch = ? WHERE id = ?", [touch, slugId], function(err, res) {
		auctionLog("Done.")
		callback();
	});
}

function checkWatchlists(slugId, callback){
	auctionLog("Starting Watchlist Check.");
	auctionLog("Watchlists not yet implemented with SQL.");
	// db.watchlist.find({
	// 	slug: slug,
	// 	region: region,
	// 	isActive: true
	// }).populate('user').exec(function(err, lists){
	// 	lists.forEach(function(list){
	// 		db.auction.find({
	// 			slugName:slug,
	// 			region:region,
	// 			item:list.item,
	// 			quantity:{$lte:list.maxQuantity, $gte:list.minQuantity},
	// 			buyoutPerItem:{$lte:list.maxBuyoutPerItem}
	// 		}).populate('item').exec(function(err, aucs){
	// 			if(!err&&aucs){
	// 				notifyWatchlistUser(list, aucs)
	// 			}
	// 		})
	// 	})
	// 	auctionLog("Watchlist Check Finished")
	// 	auctionLog("Realm Finished")
	// 	console.log("______________")
	// 	callback()
	// })
}

function notifyWatchlistUser(list, auctions){
	if(list.user){
		// console.log(list.user.email)
		var auctionMail = {
			from: 'admin@dbonyx.com',
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
	console.log((new Date() - loadTimer) + ":"+Date().toString() + ": "+outputString)
}