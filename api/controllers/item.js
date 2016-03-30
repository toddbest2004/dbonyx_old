var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/pretty/:id", function(req, res){
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
	var classes = [
			{name:"Consumable", subclasses:["Consumable", 'Potion', 'Elixir','Flask', 'Scroll', 'Food & Drink','Item Enhancement','Bandage','Other']},
			{name:'Container', subclasses:['Bag','Soul Bag', 'Herb Bag', 'Enchanting Bag','Engineering Bag','Gem Bag','Mining Bag','Leatherworking Bag','Inscription Bag','Tackle Box','Cooking Bag']},
			{name:'Weapon', subclasses:['Axe','Axe','Bow','Gun','Mace','Mace','Polearm','Sword','Sword','Obsolete','Staff','Exotic','Exotic','Fist Weapon','Miscellaneous','Dagger','Thrown','Spear','Crossbow','Wand','Fishing Pole','One-handed Melee Weapon','Melee Weapon','Ranged Weapon']},
			{name:'Gem', subclasses:['Red','Blue','Yellow','Purple','Green','Orange','Meta','Simple','Prismatic','Crystal of Fear','Cogwheel']},
			{name:'Armor', subclasses:['Miscellaneous','Cloth','Leather','Mail','Plate','Cosmetic','Shield','Libram','Idol','Totem','Sigil','Relic','Shield']},
			{name:'Reagent', subclasses:['Reagent']},
			{name:'Projectile', subclasses:['','','Arrow','Bullet']},
			{name:'Trade Goods', subclasses:['Trade Goods','Parts','Explosives','Devices','Jewelcrafting','Cloth','Leather','Metal & Stone','Cooking','Herb','Elemental','Other','Enchanting','Materials','Item Enhancement','Weapon Enchantment - Obsolete']},
			{name:'', subclasses:[]},
			{name:'Recipe', subclasses:['Book','Leatherworking','Tailoring','Engineering','Blacksmithing','Cooking','Alchemy','First Aid','Enchanting','Fishing','Jewelcrafting','Inscription']},
			{name:'', subclasses:[]},
			{name:'Quiver', subclasses:['','','Quiver','Ammo Pouch']},
			{name:'Quest', subclasses:['Quest']},
			{name:'Key', subclasses:['Key','Lockpick']},
			{name:'', subclasses:[]},
			{name:'Miscellaneous', subclasses:['Junk','Reagent','Companion Pets','Holiday','Other','Mount']},
			{name:'Glyph', subclasses:['','Warrior','Paladin','Hunter','Rogue','Priest','Death Knight','Shaman','Mage','Warlock','Monk','Druid']},
			{name:'Battle Pets', subclasses:['BattlePet']},
			{name:'WoW Token', subclasses:['WoW Token']}]
	item.itemSubClass=classes[item.itemClass].subclasses[item.itemSubClass]
	item.itemClass = classes[item.itemClass].name

	var inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
	item.inventoryType=inventoryTypes[item.inventoryType]
	
	var itemBinds = ['', 'Binds when picked up', 'Binds when equipped', 'Binds when used','']
	item.itemBind = itemBinds[item.itemBind]
	//prettify item stats
	if(item.bonusStats.length>0){
		item.stats=[]
		for(var i=0;i<item.bonusStats.length;i++){
			var stat = {}
			stat.name = 'Agility'
			stat.class = 'itemSecondaryProperty'
			stat.amount = item.bonusStats[i].amount
			item.stats.push(stat)
		}
	}
	//weapon stats
	item.weaponInfo.weaponSpeed = item.weaponInfo.weaponSpeed.toFixed(2)
	item.weaponInfo.dps = item.weaponInfo.dps.toFixed(2)
	console.log(item)

	return item
}