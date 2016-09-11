var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 20
var callCount = 0
var queryCount = 0

var ignoredKeys = ['id','bonusSummary', 'bonusLists', 'bonusStats', 'context','availableContexts', 'itemSpells', 'itemSource']
// setTimeout(start, 1000)

setTimeout(setup,2000)

function setup(){
	// db.item.update({contextComplete:true,availableContexts:[""],'contextDetails..bonusLists':{$ne:[],$exists:true}},{$set:{contextComplete:false}},{multi:true}).exec(function(err, count){
	// 	console.log(err)
	// 	console.log(count)
		start()
	// })
}

function start(){
	var itemsToProcess=false
	db.item.find({contextComplete:false}).limit(10).exec(function(err, items){
		if(err|!items||items.length===0){
			console.log("no items")
			return
		}
		items.forEach(function(item){
			itemsToProcess=true
			console.log(item.itemId)
			processItem(item)
		})
		itemQueue.drain = function(){
			console.log("item queue drained");
			if(queryCount<30000){
				start()
			}else{
				console.log("Query count: "+queryCount)
				console.log("Query threshold reached, sleeping for 1 hour.")
				setTimeout(start, 1200000)
			}
		}
	})
}

function startSpecific(id){
	db.item.findOne({itemId:id}, function(err, item){
		console.log(item.itemId)
		processItem(item)
	})
}

var itemQueue = async.queue(function(task, callback){
	processContexts(task.item, callback)
})

var contextQueue = async.queue(function(task, callback){
	console.log("context")
	console.log(task.context)
	getContextItem(task.item, task.context, function(newItem){
		var empty = true
		newItem.contextDetails[context].bonusLists.forEach(function(bonusId){
			empty = false
			console.log("bonusList pushed to queue")
			bonusListQueue.push({item:newItem,context:task.context,bonusId:bonusId},function(item){newItem = item})
		})
		newItem.contextDetails[context].defaultBonusLists.forEach(function(bonusId){
			empty = false
			console.log("defaultBonusList pushed to queue")
			bonusListQueue.push({item:newItem,context:task.context,bonusId:bonusId},function(item){newItem = item})
		})
		if(empty){
			console.log("No context bonus lists");
			callback(newItem)
		}else{
			console.log("Context bonus lists found");
			bonusListQueue.drain = function(){
				console.log("bonusListQueue drained");
				callback(newItem)
			}
		}
	})
})

var bonusListQueue = async.queue(function(task, callback){
	console.log("bonusListQueue fired");
	getBonusDetails(task, callback)
})

function processItem(item){
	itemQueue.push({item:item}, function(item){
		console.log(item);
		if(item){
			item.contextComplete = true;
			db.item.findOneAndUpdate({itemId:item.itemId},item,function(){
			console.log(queryCount)
			console.log("________")
		console.log("^^^^^^^")
			console.log(item.contextComplete)
		console.log("__________")
			})
		}
	})
}

function processContexts(item, cb){
	var empty = true

	console.log("Starting item: "+item.itemId)
	for(context in item.contextDetails){
		console.log(context)
		// if(!item.contextDetails[context].bonusStats){
			empty = false
			contextQueue.push({item:item,context:context},function(newItem){item=newItem})
		// }
	}
	if(empty){
		console.log("No contexts")
		cb(item)
	}else{
		console.log("Contexts found, creating drain.");
		contextQueue.drain=function() {
			console.log("contextQueue drained.");
			cb(item)
		};
	}
}

function getContextItem(item, context, cb){
	var url = "https://us.api.battle.net/wow/item/"+item.itemId
	if(context!==""){
		url+="/"+context
	}
	url+="?bl=-1&locale=en_US&apikey="+process.env.API
console.log(url);
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		queryCount = response.headers["x-plan-quota-current"]
		if(!error && response.statusCode===200){
			console.log(body.name);
			var details = item.contextDetails[context];
			details.bonusLists = body.bonusSummary.chanceBonusLists;
			details.defaultBonusLists = body.bonusSummary.defaultBonusLists;
			details.bonusStats = body.bonusStats
			details.bonusListDetails = {}
			cb(item)
		}else{
			console.log(error);
			console.log(response.statusCode);
			// if(response.statusCode!=404)
				cb(item)
		}
	})	
}

function getBonusDetails(task, cb){
	console.log("bonus details")
	var url = "https://us.api.battle.net/wow/item/"+task.item.itemId
	if(task.context!==""){
		url+="/"+task.context
	}
	url+="?bl="+task.bonusId+"&locale=en_US&apikey="+process.env.API

	console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		console.log("request response");
		queryCount = response.headers["x-plan-quota-current"]
		if(!error && response.statusCode===200){
			console.log("getBonusDetails: good url response")
			if(!body.bonusLists||body.bonusLists[0]!==task.bonusId){
				console.log('NO MATCH: '+task.bonusId)
				cb()
			}else{
				task.item.contextDetails[task.context].bonusListDetails[task.bonusId] = {}
				var bonus =  task.item.contextDetails[task.context].bonusListDetails[task.bonusId]
				for(key in body){
					if(body[key]!==task.item[key]&&ignoredKeys.indexOf(key)==-1){
						bonus[key] = body[key]
					}
				}
				var statDeltas = {}
				body.bonusStats.forEach(function(stat){
					statDeltas[stat.stat] = stat.amount
				})
				var bonusStats = task.item.contextDetails[task.context].bonusStats
				bonusStats.forEach(function(stat){
					statDeltas[stat.stat] -= stat.amount
				})
				for(key in statDeltas){
					if(!statDeltas[key]){
						delete(statDeltas[key])
					}
				}
				bonus.statDeltas = statDeltas
				console.log("getBonusDetails: firing cb")
				cb(task.item)
			}
		}else{
			console.log("getBonusDetails error: ");
			console.log(response.statusCode);
			console.log("firing bad url cb");
			// if(response.statusCode!=404)
			cb(task.item)
		}
	})
}