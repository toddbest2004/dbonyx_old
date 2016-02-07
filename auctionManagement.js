var fs = require("fs");
var request = require("request");
var db = require('./mongoose');
var async = require('async')
var child_process = require('child_process')
var auctionlimit = process.env.AUCTION_LIMIT || 10 //this one limits how many auctions we'll load per run

var start = new Date()

var realmcount = 0; //counts how many auctions were loaded
var auctionConcurrency = 1;
var pauseInterval = 120000 //number of miliseconds to wait after an auctionimport

var auctionQueue = async.queue(function(task, callback){
	// if(!task){
		// setTimeout(callback, 5000)
	// }else{
		importAuctionDataFromServer(task.body, task.slug, task.region, task.lastModified, callback)
	// }
}, auctionConcurrency)

auctionQueue.drain = function(){
	console.log(realmcount+ " realms completed in "+(new Date()-start))
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
			checkServerForUpdatedAuctions(url, slug, region, touch,realms[i])
		}
	})

}

function checkServerForUpdatedAuctions(url, slug, region, touch, realm){
	console.log("Starting realm: "+slug)
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
				console.log(slug+": "+lastModified);
			}else{
				// auctionQueue.push(false, function(){console.log(slug+": up to date.")})
			}
		}else{
			console.log(response.statusCode)
		}
	});
}

function importAuctionDataFromServer(url, slug, region, touch,callback){
	console.log("Requesting auction data."+(new Date()-start))
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		console.log("Auction data recieved"+(new Date()-start))
		if(!error && response.statusCode===200){
			// writeAuctionDataToFile(body,slug,region,touch,callback)
			bulkImport(body, slug, region, touch, callback)
		}
	});
}

function writeAuctionDataToFile(auctionData,slug,region,touch,callback){
	var writeStream = fs.createWriteStream('./auctionStaging/'+region+'-'+slug+'.json')
	console.log(auctionData.auctions.length)
	writeStream.on('finish', function(){
		console.log("done writing")
		importAuctionsFromFile(slug,region,touch,callback)
	})
	for(var i=0; i<auctionData.auctions.length;i++){
		var temp = auctionData.auctions[i]
		temp._id = temp.auc
		temp.bidPerItem = Math.round(temp.bid/temp.quantity)
		temp.buyoutPerItem = Math.round(temp.buyout/temp.quantity)
		temp.slugName = slug
		temp.region = region
		temp.touch = touch;
		temp.startTime = temp.timeLeft

		delete temp.auc
		delete temp.ownerRealm
		auctionData.auctions[i] = temp
		writeStream.write(JSON.stringify(auctionData.auctions[i])+"\n")
	}
	writeStream.end('')
}

function importAuctionsFromFile(slug,region,touch,callback){
	var exec = require('child_process').exec;
	var filename = './auctionStaging/'+region+'-'+slug+'.json'
	var cmd = 'mongoimport -d dbonyx --collection auctions --file '+filename+' --upsert --upsertFields _id';
	var cmdArray = ['mongoimport', '-d dbonyx', '--collection auctions', '--file '+filename]
	// exec(cmd, function(error, stdout, stderr) {
	child_process.exec(cmd, function(error, stdout, stderr){
		if(stderr)
			console.log(stdout, stderr)
		fs.unlink(filename, function(){
			updateAuctionHistory(slug, region, touch, callback);
		})
	});
}

function bulkImport(auctionData, slug, region, touch, callback){
	console.log("Initializing bulk op."+(new Date()-start))
	var bulkImport = db.auction.collection.initializeUnorderedBulkOp()
	for(var i=0; i<auctionData.auctions.length;i++){
		var temp = auctionData.auctions[i]
		temp._id = temp.auc
		
		temp.bidPerItem = Math.round(temp.bid/temp.quantity)
		temp.buyoutPerItem = Math.round(temp.buyout/temp.quantity)
		temp.slugName = slug
		temp.region = region
		temp.touch = touch;
		temp.startTime = temp.timeLeft
		temp.$setOnInsert={firstbid:temp.bid}
		// delete temp.auc
		// delete temp.ownerRealm
		auctionData.auctions[i] = temp
		bulkImport.find({_id:temp._id}).upsert().updateOne(temp)
	}
	console.log(auctionData.auctions.length+" operations queued.")
	console.log(slug+": starting bluk import"+(new Date()-start))
	bulkImport.execute(function(err, data){
		removeOldAuctions(slug, region, touch, callback)
		// updateAuctionHistory(slug,region,touch,callback)
	})
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
				console.log(err)
			console.log("Auction history completed in: "+(new Date()-start))
			removeOldAuctions(slug, region, touch, callback)
		})
	})
}

function removeOldAuctions(slug, region, touch, callback){
	console.log("Starting old auction removal."+(new Date()-start))
	db.auction.remove({region:region,slugName:slug,touch:{$lt:touch}}, function(err){
		if(err)
			console.log(err)
		console.log("Old auctions removed in "+(new Date()-start))
		callback()
	})
}