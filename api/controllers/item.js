var express = require("express")
var router = express.Router()
var itemConstants = require('./itemConstants')
var db = require("../../mongoose")

router.get("/pretty/:id", function(req, res){
	var id = parseInt(req.params.id)
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
		item=prettify(item)
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

function prettify(item){

	item.itemSubClass = itemConstants.classes[item.itemClass].subclasses[item.itemSubClass]
	item.itemClass = itemConstants.classes[item.itemClass].name

	item.inventoryType=itemConstants.inventoryTypes[item.inventoryType]
	
	item.itemBind = itemConstants.itemBinds[item.itemBind]
	//prettify item stats
	if(item.bonusStats.length>0){
		item.stats=[]
		for(var i=0;i<item.bonusStats.length;i++){
			//Get the bonus stat information from itemConstants.js			
			var mystat = itemConstants.bonusStats[item.bonusStats[i].stat]||{}
			var stat = {}
			stat.name = mystat.name||'UNKNOWN STAT'
			stat.class = itemConstants.bonusStatClasses[mystat.class||0]
			stat.order = item.bonusStats[i].stat
			stat.amount = item.bonusStats[i].amount
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
		item.itemSet.equipped=2
		for(var i=0; i<item.itemSet.items.length;i++){
			//TODO: test against equipped modifiers
			item.itemSet.items[i].equipped=false
		}
	}
	// console.log(item.itemSet)

	return item
}