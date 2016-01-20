var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 80

var itemQueue = async.queue(function(task, callback){
	insertItem(task.body, callback)
})

var json = ["id","disenchantingSkillRank","description","name","icon","stackable","itemBind","buyPrice","itemClass","itemSubClass","containerSlots","inventoryType","equippable","itemLevel","maxCount","maxDurability","minFactionId","minReputation","quality","sellPrice","requiredSkill","requiredLevel","requiredSkillRank","baseArmor","hasSockets","isAuctionable","armor","displayInfoId","nameDescription","nameDescriptionColor","upgradable","heroicTooltip","context","itemSet","boundZone"]
var json2 = ["bonusStats", "itemSpells", "itemSource", "bonusLists", "availableContexts", "bonusSummary", "weaponInfo", "socketInfo", "requiredAbility", "allowableClasses", "allowableRaces"]
var reported = [];

// findItems()

db.item.findOne({}).sort({itemId:-1}).exec(function(err, count){
	// console.log(count)
	startCount=0
	if(count){
		startCount = count.itemId
	}
	myCount = startCount
	setTimer()
})

function setTimer(){
	intervalId = setInterval(function(){findItems()}, 1100)
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
		url = "https://us.api.battle.net/wow/item/"+id+"/"+context+"?locale=en_US&apikey="+process.env.API
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
			console.log(response.statusCode)
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
					return
				}
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
					for(var i=0; i<body.bonusStats.length; i++){
						// addStats(item, i);
						item.hasItemStats = true
					}
				}
				//TODO: Currently an error with adding spells. not sure why.
				if(body.itemSpells.length>0){
					// console.log("spells")
					item.itemSpells=[]
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
				if(item.itemSet){
					item.itemSet = item.itemSet.id	
				}
				if(item.availableContexts && item.availableContexts !== "" && item.availableContexts.length>0){
					//TODO: Handle multiple contexts
				}
				if(item.bonusSummary.defaultBonusLists.length!==0){
					item.hasItemBonusLists = true;
				}
				item.save(function(err){
					console.log("saved")
					if(err){
						console.log(err)
					}
					// console.log(item)
					callback()
				})
			})
		}else{
			callback()
			// console.log(item)
		}
	})
}

//These are not currently called
//

function addSpells(item, i){
	db.spell.findOrCreate({where:{spellId:item.itemSpells[i].spellId}}).spread(function(spell, created){
		spell.name = item.itemSpells[i].spell.name
		spell.icon = item.itemSpells[i].spell.icon
		spell.description = item.itemSpells[i].spell.description
		spell.castTime = item.itemSpells[i].spell.castTime
		spell.save()
		item.addSpell(spell, {nCharges:item.itemSpells[i].nCharges, consumable:item.itemSpells[i].consumable, categoryId:item.itemSpells[i].categoryId, triggerType:item.itemSpells[i].trigger}).then(function(){
			
		})
	})
}
