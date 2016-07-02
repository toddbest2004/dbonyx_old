var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 40
var queryCount = 0

console.log(process.argv[2])

var itemQueue = async.queue(function(task, callback){
	insertItem(task.body, callback)
})

var json = ["id","disenchantingSkillRank","description","name","icon","stackable","itemBind","buyPrice","itemClass","itemSubClass","containerSlots","inventoryType","equippable","itemLevel","maxCount","maxDurability","minFactionId","minReputation","quality","sellPrice","requiredSkill","requiredLevel","requiredSkillRank","baseArmor","hasSockets","isAuctionable","armor","displayInfoId","nameDescription","nameDescriptionColor","upgradable","heroicTooltip","context","itemSet","boundZone"]
var json2 = ["bonusStats", "itemSpells", "itemSource", "bonusLists", "availableContexts", "bonusSummary", "weaponInfo", "socketInfo", "requiredAbility", "allowableClasses", "allowableRaces"]
var reported = [];

startImport(parseInt(process.argv[2])||null)
// findItem(929)

function startImport(start){
	if(start){
		startCount = start
		myCount = start
		setTimer()
	}else{	
		db.item.findOne({}).sort({itemId:-1}).exec(function(err, count){
			// console.log(count)
			startCount=0
			if(count){
				startCount = count.itemId
			}
			myCount = startCount
			setTimer()
		})
	}
}

function setTimer(){
	intervalId = setInterval(function(){findItems()}, 1500)
}

function findItems(){
	for(var i=myCount; i<(myCount+increment);i++){
	 	findItem(i, null)
	}
	myCount+=increment
	if(myCount > 150000){
		console.log("Item id: "+myCount)
		console.log("Maximum id reached. Ending.")
		clearInterval(intervalId)
		return
	}
	if(queryCount > 30000){
		console.log("Query count: "+queryCount)
		console.log("Query threshold reached, sleeping for 1 hour.")
		clearInterval(intervalId)
		setTimeout(startImport, 1200000)
	}
}

function findItem(id, context){
	//console.log("loading")
	var url
	if(context){
		url = "https://us.api.battle.net/wow/item/"+id+"/"+context+"?bl=-1&locale=en_US&apikey="+process.env.API
	}else{
		url = "https://us.api.battle.net/wow/item/"+id+"?bl=-1&locale=en_US&apikey="+process.env.API
	}
	// console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			queryCount = response.headers["x-plan-quota-current"]
			itemQueue.push({body:body}, function(){console.log(id+ ": done.")})
		}else{
			// if(response.statusCode!=404)
				// console.log(id, body)
		}
	})	
}

function insertItem(body, callback){
	// console.log("****"+body.id)
	db.item.findOne({_id:body.id}).exec(function(err, item){
		if(err){
			console.log(err)
			return callback()
		}
		if(!item){
			db.item.create({_id:body.id}, function(err, item){
				if(err){
					console.log(err)
					return callback()
				}
				processItem(item, body, callback)
			})
		}else{
			processItem(item, body, callback)
			// console.log(item)
		}
	})
}

function processItem(item, body, callback){

	item.itemId = body.id
	for(var key in body){
		item[key] = body[key]
	}
	// console.log(body.socketInfo)
	if(body.boundZone){
		item.boundZone = body.boundZone.id
	}
	// console.log(item)
	if(body.bonusStats.length>0){
			item.hasItemStats = true
	}
	if(body.itemSpells.length>0){
		item.hasItemSpells = true
	}
	if(body.weaponInfo){
		item.weaponInfo = body.weaponInfo
		item.isWeapon = true

	}
	if(body.hasSockets){
		item.socketInfo.sockets=[]
		item.itemHasSockets = true
		item.socketBonusString = body.socketInfo.socketBonus
		for(var i=0; i<body.socketInfo.sockets.length; i++){
			item.socketInfo.sockets[i]={type:body.socketInfo.sockets[i].type}
			// console.log(item.socketInfo.sockets[i])
		}
	}
	if(item.itemSet&&item.itemSet.id){
		item.hasItemSet = true;
	}
	item.availableContexts = [];
	if(body.availableContexts && body.availableContexts !== ""){
		item.availableContexts = body.availableContexts;
		item.contextDetails = {}
		body.availableContexts.forEach(function(context){
			// console.log(context)
			item.contextDetails[context]={}
			var details = item.contextDetails[context];
			if(context === body.context){
				details.bonusLists = body.bonusSummary.chanceBonusLists;
				details.defaultBonusLists = body.bonusSummary.defaultBonusLists;
				details.bonusStats = item.bonusStats
				details.bonusListDetails = {}
			}
		})
		if(body.availableContexts.length>1){
			item.contextComplete=false;
		}
	}
	item.save(function(err){
		// console.log("saved")
		if(err){
			console.log(err)
		}
		// console.log(item)
		callback()
	})
}


