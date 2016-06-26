var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 20
var callCount = 0

var ignoredKeys = ['id','bonusSummary', 'bonusLists', 'bonusStats', 'context','availableContexts', 'itemSpells', 'itemSource']
setTimeout(start, 1000)

function start(){
	db.item.find({contextComplete:false}).limit(10).exec(function(err, items){
		if(err|!items||items.length===0){
			console.log("no items")
			return
		}
		items.forEach(function(item){
			console.log(item.itemId)
			processItem(item)
		})
		itemQueue.drain = function(){console.log("itemQueue drained")}
	})
}

var itemQueue = async.queue(function(task, callback){
	processContexts(task.item, callback)
})

var contextQueue = async.queue(function(task, callback){
	getContextItem(task.item, task.context, function(newItem){
		var empty = true
		newItem.contextDetails[context].bonusLists.forEach(function(bonusId){
			empty = false
			bonusListQueue.push({item:newItem,context:task.context,bonusId:bonusId},function(item){newItem = item})
		})
		newItem.contextDetails[context].defaultBonusLists.forEach(function(bonusId){
			empty = false
			bonusListQueue.push({item:newItem,context:task.context,bonusId:bonusId},function(item){newItem = item})
		})
		if(empty){
			callback(newItem)
		}else{
			bonusListQueue.drain = function(){
				callback(newItem)
			}
		}
	})
})

var bonusListQueue = async.queue(function(task, callback){
	getBonusDetails(task, callback)
})

function processItem(item){
	item.contextComplete = true;
	itemQueue.push({item:item}, function(item){db.item.findOneAndUpdate({itemId:item.itemId},item,function(){
		console.log(item)
		console.log("________")
		console.log(callCount)

	})})
}

function processContexts(item, cb){
	var empty = true
	for(context in item.contextDetails){
		// console.log(context)
		// if(!item.contextDetails[context].bonusStats){
			empty = false
			contextQueue.push({item:item,context:context},function(newItem){item=newItem})
		// }
	}
	if(empty){
		cb(item)
	}else{
		contextQueue.drain=function(){cb(item)};
	}
}

function getContextItem(item, context, cb){
	var url = "https://us.api.battle.net/wow/item/"+item.itemId+"/"+context+"?bl=-1&locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		callCount++
		if(!error && response.statusCode===200){
			var details = item.contextDetails[context];
			details.bonusLists = body.bonusSummary.chanceBonusLists;
			details.defaultBonusLists = body.bonusSummary.defaultBonusLists;
			details.bonusStats = body.bonusStats
			details.bonusListDetails = {}
			cb(item)
		}else{
			// if(response.statusCode!=404)
				cb(item)
		}
	})	
}

function getBonusDetails(task, cb){
	var url = "https://us.api.battle.net/wow/item/"+task.item.itemId+"/"+task.context+"?bl="+task.bonusId+"&locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		callCount++
		if(!error && response.statusCode===200){
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
				cb(task.item)
			}
		}else{
			// if(response.statusCode!=404)
			cb(task.item)
		}
	})
}