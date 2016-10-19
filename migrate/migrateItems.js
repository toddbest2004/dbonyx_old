"use strict";
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_NAME
});
var mongo = require("./mongoose");

setTimeout(function(){ 
	getItemsAndImport(0);
}, 2000);

function getItemsAndImport(id) {
	var queryData = [];
	mongo.item.find({_id:{$gt:id}}).limit(1000).sort({'_id':1}).exec(function(err, items) {
		if(!items) {
			console.log("Done migrating basic item info");
			return;
		}
		items.forEach(function(item) {
			queryData.push([
				item._id,
				item.description,
				item.name,
				item.icon,
				item.stackable,
				item.disenchantingSkillRank,
				item.itemBind,
				item.buyPrice,
				item.itemClass,
				item.itemSubClass,
				item.containerSlots, 
				item.inventoryType, 
				item.equippable, 
				item.itemLevel, 
				item.maxCount, 
				item.maxDurability, item.minFactionId, item.minFactionReputation, item.quality, item.sellPrice, item.requiredSkill, item.requiredSkillRank, item.requiredLevel, item.hasSockets, item.baseArmor, item.isAuctionable, item.armor, item.displayInfoId, item.nameDescription, item.nameDescriptionColor, item.upgradeable, item.heroicTooltip, item.hasRandomEnchants, item.context, item.isWeapon, item.hasItemSet, item.hasItemBonusLists, item.hasItemSpells
			]);
		});
		if(queryData.length>0) {
			sendQueryPacket(queryData);
			queryData = [];
		}
	});
}

function sendQueryPacket(queryData) {
	console.log("sending packet");
	var query = "INSERT IGNORE INTO items ("
		+ "id,description,name,icon,stackable,disenchantingSkillRank,itemBind,buyPrice,itemClass,itemSubClass,containerSlots,inventoryType,equippable,itemLevel,maxCount,maxDurability,minFactionId,minFactionReputation,quality,sellPrice,requiredSkill,requiredSkillRank,requiredLevel,hasSockets,baseArmor,isAuctionable,armor,displayInfoId,nameDescription,nameDescriptionColor,upgradeable,heroicTooltip,hasRandomEnchants,context,isWeapon,hasItemSet,hasItemBonusLists,hasItemSpells"
		+ ") values ?;";
	connection.query(query, [queryData], function(err, res, fields) {
		console.log(err);
		console.log(res);
		if(queryData.length>0){
			getItemsAndImport(queryData[queryData.length-1][0]);
		}
	});
}