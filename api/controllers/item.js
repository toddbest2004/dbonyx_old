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
	var modifiers = req.query
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
		item=prettify(item, modifiers)
		res.send({item:item})
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

function prettify(item, modifiers){

	item.itemSubClass = itemConstants.classes[item.itemClass].subclasses[item.itemSubClass]
	item.itemClass = itemConstants.classes[item.itemClass].name

	item.inventoryType=itemConstants.inventoryTypes[item.inventoryType]
	
	item.itemBind = itemConstants.itemBinds[item.itemBind]
	//prettify item stats
	var bonusStats = item.contextDetails[item.context].bonusStats
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

	//itemSets
	if(item.itemSet){
		item.itemSet.equipped=0
		for(var i=0; i<item.itemSet.items.length;i++){
			//TODO: test against equipped modifiers
			item.itemSet.items[i].equipped=false
		}
	}

	if(item.itemSpells){
		for(var i=0; i<item.itemSpells.length;i++){
			var spell=item.itemSpells[i]
			if(spell.spell.description===''&&spell.trigger=="ON_USE"){
				spell.spell.description=item.description
			}
			spell.trigger = itemConstants.itemSpellTriggers[spell.trigger]

		}
	}
	// console.log(item.itemSet)
	var rand
	if(rand = parseInt(modifiers.rand)){
		item.name+=itemConstants.randIds[rand]?itemConstants.randIds[rand].suffix:' of Unknown Enchant'
	}

	return item
}