'use strict';
var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0;
var myCount = 0;
var intervalId = 0;
var increment = 40;
var queryCount = 0;

console.log(process.argv[2]);

startImport(parseInt(process.argv[2])||null);
// findItem(929)

var questQueue = async.queue(function(task, callback){
	insertQuest(task.body, callback);
});

function startImport(start){
	queryCount=0;
	if(start){
		startCount = start;
		myCount = start;
		setTimer();
	}else{	
		db.quest.findOne({}).sort({itemId:-1}).exec(function(err, count){
			// console.log(count)
			startCount=0;
			if(count){
				startCount = count._id;
			}
			myCount = startCount;
			setTimer();
		});
	}
}

function setTimer(){
	intervalId = setInterval(function(){findQuests();}, 1500);
}

function findQuests(){
	for(var i=myCount; i<(myCount+increment);i++){
	 	findQuest(i);
	}
	myCount+=increment;
	if(myCount > 45000){
		console.log("Item id: "+myCount);
		console.log("Maximum id reached. Ending.");
		clearInterval(intervalId);
		return;
	}
	if(queryCount > 30000){
		console.log("Query count: "+queryCount);
		console.log("Query threshold reached, sleeping for 20 minutes.");
		clearInterval(intervalId);
		setTimeout(startImport, 1200000);
	}
}


function findQuest(id){
	//console.log("loading")
	var url = "https://us.api.battle.net/wow/quest/"+id+"?locale=en_US&apikey="+process.env.API;

	// console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			queryCount = response.headers["x-plan-quota-current"];
			questQueue.push({body:body}, function(){console.log(id+ ": done.");});
		}
	});
}

function insertQuest(body, cb){
	body._id=body.id;
	db.quest.findOneAndUpdate({_id:body.id},{$set:body},{upsert:true}).exec(function(){
		cb();
	});
}