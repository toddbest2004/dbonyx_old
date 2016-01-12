var fs = require("fs");
var request = require("request");
var db = require('./mongoose');
var async = require('async')
var child_process = require('child_process')
var auctionlimit = process.env.AUCTION_LIMIT || 10 //this one limits how many auctions we'll load per run

var start = new Date()

var realmcount = 0; //counts how many auctions were loaded
var auctionConcurrency = 2;
var pauseInterval = 120000 //number of miliseconds to wait after an auctionimport

var auctionQueue = async.queue(function(task, callback){
	importAuctionDataFromServer(task.body, task.slug, task.region, task.lastModified, callback)
}, auctionConcurrency)

auctionQueue.drain = function(){
	console.log(realmcount+ " realms completed in "+(new Date()-start))
	if(realmcount>=10){
		load_auction_data()
		start = new Date()
	}else{
		setTimeout(load_auction_data, pauseInterval)
		start = new Date()
	}
	realmcount=0
}

setTimeout(load_auction_data, 1000)

function load_auction_data(){
	db.realm.find({isMasterSlug:true}, null, {sort:{auctiontouch:1}}).then(function(realms){
		for(var i=0; i<auctionlimit;i++){			
			var slug = realms[i].slug
			var region = realms[i].region
			var touch = realms[i].auctiontouch
			//https://us.api.battle.net/wow/auction/data/medivh?locale=en_US&apikey=
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
				console.log(lastModified);
			}
		}else{
			console.log(response.statusCode)
		}
	});
}

function importAuctionDataFromServer(url, slug, region, touch,callback){
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			writeAuctionDataToFile(body,slug,region,touch,callback)
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

function updateAuctionHistory(slug, region, touch, callback){
	// db.auction.remove({region:region,slugName:slug,touch:{$lt:touch}}, function(err){
	// 	if(err){
	// 		console.log(err)
	// 	}
		console.log("Completed in: "+(new Date()-start))
		callback()
	// })
}