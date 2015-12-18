var fs = require("fs");
var request = require("request");
var db = require('../mongoose');

var start = new Date()

var realmcount = 0; //counts how many auctions were loaded

setTimeout(load_auction_data, 1000)

function load_auction_data(){
	db.realm.find({isMasterSlug:true}, null, {sort:{auctiontouch:1}}).then(function(realms){
		var auctionlimit = process.env.AUCTION_LIMIT || 2 //this one limits how many auctions we'll load per run
		console.log(auctionlimit)
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
				importAuctionDataFromServer(body.files[0].url, slug, region, lastModified)
				console.log(lastModified);
			}
		}else{
			console.log(error, response.statusCode)
		}
	});
}

function importAuctionDataFromServer(url, slug, region, touch){
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			writeAuctionDataToFile(body,slug,region,touch)
		}else{
			console.log(error, response.statusCode)
		}
	});
}

function writeAuctionDataToFile(auctionData,slug,region,touch){
	var writeStream = fs.createWriteStream('./auctionStaging/'+region+'-'+slug+'.json')
	console.log(auctionData.auctions.length)
	writeStream.on('finish', function(){
		console.log("done writing")
		importAuctionsFromFile(slug,region,touch)
	})
	for(var i=0; i<auctionData.auctions.length;i++){
		var temp = auctionData.auctions[i]
		temp._id = temp.auc
		temp.bidPerItem = Math.round(temp.bid/temp.quantity)
		temp.buyoutPerItem = Math.round(temp.buyout/temp.quantity)
		temp.slugName = slug
		temp.region = region
		temp.touch = 10;
		temp.startTime = temp.timeLeft

		delete temp.auc
		delete temp.ownerRealm
		auctionData.auctions[i] = temp
		writeStream.write(JSON.stringify(auctionData.auctions[i])+"\n")
	}
	writeStream.end('')
}

function importAuctionsFromFile(slug,region,touch){
	var exec = require('child_process').exec;
	var filename = './auctionStaging/'+region+'-'+slug+'.json'
	var cmd = 'mongoimport --db dbonyx --collection auctions --file '+filename+' --upsert --upsertFields _id';

	exec(cmd, function(error, stdout, stderr) {
		console.log(stdout)
		fs.unlink(filename, function(){
			updateAuctionHistory(slug, region, touch);
		})
	});
}

function updateAuctionHistory(slug, region, touch){
	console.log("Updating auction history.")
	console.log("Completed in: "+(new Date()-start))
}