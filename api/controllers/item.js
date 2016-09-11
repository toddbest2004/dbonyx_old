var express = require("express")
var router = express.Router()
var itemConstants = require('./itemConstants')
var db = require("../../mongoose")

router.get('/search/:term', function(req, res){
	var term = req.params.term
	if(typeof(term)!='string'){
		res.status(400).json({error:'Invalid search term.'})
		return
	}
	db.item.find({name: new RegExp(term,'i')}).limit(10).lean().exec(function(err, items){
		if(err){
			res.status(400).json({error:"Error reading from database."})
			return
		}
		res.json(items)
	})
})

router.get("/pretty/:id", function(req, res){
	var id = parseInt(req.params.id)
	var modifiers = req.query.modifiers
	try{
		modifiers = JSON.parse(modifiers)
	}catch(e){
		modifiers = {}
	}
	if(!id){
		res.status(400).send({error:"Invalid id."})
		return
	}
	db.item.findOne({_id:id}).populate('itemSet.items').lean().exec(function(err, item){
		if(err){
			res.status(400).send({error:"Invalid id."})
			return
		}
		if(!item){
			res.status(404).send({error:"Item not found."})
			return
		}

		item=prettify(item, modifiers, res);
		// res.send({item:item})
		return
	})
})

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id)
	if(!id){
		res.status(400).send({error:"Invalid id."})
		return
	}
	db.item.findOne({_id:id}).lean().exec(function(err, item){
		if(err){
			res.status(400).send({error:"Invalid id."})
			return
		}
		if(!item){
			res.status(404).send({error:"Item not found."})
			return
		}
		res.send({item:item})
		return
	})
})



module.exports = router

function prettify(item, modifiers, res){
	//todo: track equipped itemset items
	//todo: update based on bonuslists/contexts

	//auction modifiers
	if(modifiers.modifiers){
		if(Array.isArray(modifiers.modifiers)){
			modifiers.modifiers.forEach(function(modifier){
				// console.log(modifier)
			})
		}
	}

	//special handling of caged battlepets
	if(item.itemId===82800){
		prettifyPet(item, modifiers, res);
		return;
	}

	if(modifiers.context&&item.availableContexts.indexOf(modifiers.context)!==-1){
		item.context=modifiers.context
	}
	item.stats = item.contextDetails[item.context].bonusStats||item.stats
	// console.log(item.stats)
	//modifiers
	var bonusStats = {}
	if(item.stats){
		item.stats.forEach(function(stat){
			bonusStats[stat.stat]=stat.amount
		})
	}

	if(modifiers.bonusLists){
		modifiers.bonusLists.forEach(function(bonusId){
			//auctionhouse conversion
			if(bonusId.bonusListId){
				bonusId=bonusId.bonusListId;
			}

			if(!item.contextDetails){
				var bonuses = item.contextDetails[item.context].bonusListDetails[bonusId]

				for(key in bonuses){
					if(key==='statDeltas'){

						for(stat in bonuses[key]){
							bonusStats[stat]=bonusStats[stat]||0
							bonusStats[stat]+=bonuses[key][stat]
						}
					}else if(key==='nameDescription'){
						item.nameDescription += " " + bonuses[key]
					}else if(key==='itemSet'){
						//ignore
					}else{
						item[key]=bonuses[key]
					}
				}
			}else{
				console.log("No item context details for item: "+item._id);
				console.log("item context: "+item.context);
				console.log("item bonusId: "+bonusId);
			}
		})
	}
		// console.log(item.itemSet)
	item.statDetails = []
	for(key in bonusStats){
		item.statDetails.push({stat:parseInt(key), amount:bonusStats[key]}) 
	}
	// console.log(modifiers)

	item.itemSubClass = itemConstants.classes[item.itemClass].subclasses[item.itemSubClass]
	item.itemClass = itemConstants.classes[item.itemClass].name

	item.inventoryType=itemConstants.inventoryTypes[item.inventoryType]
	
	item.itemBind = itemConstants.itemBinds[item.itemBind]
	//prettify item stats
	var bonusStats = item.statDetails||[]
	if(bonusStats.length>0){
		item.stats=[]
		for(var i=0;i<bonusStats.length;i++){
			//Get the bonus stat information from itemConstants.js			
			var mystat = itemConstants.bonusStats[bonusStats[i].stat]||{}
			var stat = {}
			stat.name = mystat.name||'UNKNOWN STAT'
			stat.class = itemConstants.bonusStatClasses[mystat.class||0]
			stat.order = bonusStats[i].stat
			stat.amount = bonusStats[i].amount
			item.stats.push(stat)
		}
	}

	//weapon stats
	if(item.weaponInfo){
		item.weaponInfo.weaponSpeed = item.weaponInfo.weaponSpeed.toFixed(2)
		item.weaponInfo.dps = item.weaponInfo.dps.toFixed(2)
	}

		// console.log(modifiers)
	//Item Sets
	if(modifiers.tooltipParams&&modifiers.tooltipParams.set){
		// console.log(modifiers)
		item.itemSet.equipped=0
		for(var i=0; i<item.itemSet.items.length;i++){
			item.itemSet.items[i].equipped=false
			if(modifiers.tooltipParams.set.indexOf(item.itemSet.items[i].itemId)!==-1){
				item.itemSet.items[i].equipped=true
				item.itemSet.equipped++
			}
		}
	}

	//allowable classes
	if(item.allowableClasses&&item.allowableClasses.length > 0){
		var classes = [];
		for(var i=0; i<item.allowableClasses.length; i++){
			classes.push(itemConstants.characterClasses[item.allowableClasses[i]]);
		}
		item.allowableClasses = classes;
	}

	//Item Spells
	if(item.itemSpells){
		for(var i=0; i<item.itemSpells.length;i++){
			var spell=item.itemSpells[i]
			if(spell.spell.description===''&&spell.trigger=="ON_USE"){
				spell.spell.description=item.description
			}
			spell.trigger = itemConstants.itemSpellTriggers[spell.trigger]

		}
	}

	//Item Random Enchants
	var rand
	if(rand = parseInt(modifiers.rand)){
		item.name+=itemConstants.randIds[rand]?itemConstants.randIds[rand].suffix:' of Unknown Enchant'
	}

	// console.log(item)

	res.send({item:item});
}

function prettifyPet(item, modifiers, res){
	//Item Spells
	if(item.itemSpells){
		for(var i=0; i<item.itemSpells.length;i++){
			var spell=item.itemSpells[i]
			if(spell.spell.description===''&&spell.trigger=="ON_USE"){
				spell.spell.description=item.description
			}
			spell.trigger = itemConstants.itemSpellTriggers[spell.trigger]

		}
	}
	if(modifiers&&modifiers.modifiers&&Array.isArray(modifiers.modifiers)){
		var petId, petLevel;
		modifiers.modifiers.forEach(function(modifier){
			if(modifier.type===3){
				petId = modifier.value;
			}
			if(modifier.type===5){
				petLevel = modifier.value;
			}
		})
		db.battlepet.findOne({_id:petId}, function(err, battlepet){
			item.name=battlepet.name;
			item.icon=battlepet.icon;
			res.send({item:item});
		})
	}
}