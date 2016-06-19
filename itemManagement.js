var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 20

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
	if(myCount > startCount + 10000){
		clearInterval(intervalId)
	}
}

function findItem(id, context){
	//console.log("loading")
	var url
	if(context){
		url = "https://us.api.battle.net/wow/item/"+id+"/"+context+"?bl=-1&locale=en_US&apikey="+process.env.API
	}else{
		url = "https://us.api.battle.net/wow/item/"+id+"?locale=en_US&apikey="+process.env.API
	}
	// console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			itemQueue.push({body:body}, function(){console.log("item: done.")})
		}else{
			// if(response.statusCode!=404)
				console.log(id, body)
		}
	})	
}

function insertItem(body, callback){
	console.log("****"+body.id)
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
		// console.log("stats")
		// for(var i=0; i<body.bonusStats.length; i++){
			// addStats(item, i);
			item.hasItemStats = true
		// }
	}
	if(body.itemSpells.length>0){
		// console.log("spells")
		// item.itemSpells=[]
		item.hasItemSpells = true
		for(var i=0; i<body.itemSpells.length; i++){
			// console.log(body.itemSpells[i])
		}
	}
	if(body.weaponInfo){
		// console.log("weapon")
		item.weaponInfo = body.weaponInfo
		// addWeaponInfo(item)
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
	// if(item.itemSet){
	// 	item.itemSet = item.itemSet.id	
	// }
	if(item.availableContexts && item.availableContexts !== "" && item.availableContexts.length>0){
		//TODO: Handle multiple contexts
	}
	item.hasItemBonusLists = false;
	if(item.bonusSummary.chanceBonusLists.length>0||item.bonusSummary.defaultBonusLists.length>0||item.bonusSummary.bonusChances.length>0){
		item.bonusSummary = body.bonusSummary;
		item.hasItemBonusLists = true;
		item.bonusListProcessed = false;
	}
	item.save(function(err){
		console.log("saved")
		if(err){
			console.log(err)
		}
		// console.log(item)
		callback()
	})
}


