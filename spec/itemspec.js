var request = require("request");
var db = require('../mongoose');
var base_url = 'http://'+process.env.IP+':'+process.env.PORT;

describe("Item Prettify", function(){
	it("should find items from database", function(done){
		db.item.findOne({itemId:1300}).exec(function(err, item){
			expect(err).toBeNull()
			expect(item).toBeDefined()
			done()
		})
	})
	describe("should have base item details without modifiers", function(){
		it("Should get item class, subclass and type", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.inventoryType).toBe("Two-handed Weapon")
				expect(item.itemClass).toBe("Weapon")
				expect(item.itemSubClass).toBe("Staff")
				done()
			})
		})
		it("Should get itemBind", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.itemBind).toBe("Binds when equipped")
				done()
			})
		})
		it("Should get item name", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.name).toBe("Lesser Staff of the Spire")
				done()
			})			
		})
		it("Should get item quality", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.quality).toBe(2)
				done()
			})			
		})
		it("Should handle weapon stats", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.weaponInfo).toBeDefined()
				expect(item.weaponInfo.dps).toBe("7.06")
				expect(item.weaponInfo.weaponSpeed).toBe("3.40")
				done()
			})			
		})
		it("Should handle default contexts", function(done){
			request.get({url:base_url+"/api/item/pretty/1300", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.context).toBe("")
				done()
			})			
		})
		it("Should handle item Spells", function(done){
			request.get({url:base_url+"/api/item/pretty/1482", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)

				var item = body.item
				expect(item.itemSpells).toBeDefined()
				expect(item.itemSpells.length).toBe(1)

				var spell = item.itemSpells[0]
				expect(spell.spellId).toBe(144268)
				expect(spell.spell).toBeDefined()
				expect(spell.spell.name).toBe("Shadow Bolt")
				expect(spell.nCharges).toBe(0)
				expect(spell.consumable).toBe(false)
				expect(spell.categoryId).toBe(0)
				expect(spell.trigger).toBe("Chance On Hit")
				done()
			})			
		})
		it("Should handle bonus stats", function(done){
			request.get({url:base_url+"/api/item/pretty/7728", json:true}, function(err, response, body){
				expect(err).toBeNull()
				expect(response.statusCode).toBe(200)
				var item = body.item
				expect(item.stats).toBeDefined()
				expect(item.stats.length).toBe(3)
				expect(item.stats).toContain({
					name:'Intellect',
					class:'itemPrimaryProperty',
					order:5,
					amount: 11
				})
				expect(item.stats).toContain({
					name: 'Versatility',
					class: 'itemSecondaryProperty',
					order: 40,
					amount: 7 
				})
				expect(item.stats).toContain({ 
					name: 'Stamina',
					class: 'itemPrimaryProperty',
					order: 7,
					amount: 6
				})
				done()
			})			
		})
	})
	describe("Should handle item modifiers", function(){
		var armorModifiers = { bonusLists: [ 560, 563 ],context: 'raid-finder',armor: 133,stats: [ { amount: 242, stat: 73 }, { amount: 127, stat: 32 },{ amount: 196, stat: 36 },{ amount: 364, stat: 7 } ],tooltipParams: {timewalkerLevel: 100,upgrade: { itemLevelIncrement: 10, total: 2, current: 2 },set: [ 128121, 128125, 128054 ] },itemLevel: 701,quality: 4,icon: 'inv_boots_leather_draenorhonors2_c_01',name: 'Ironpelt Boots', id: 128054 }
  		var armorId = 128054
  		var weaponModifiers = { bonusLists: [ 139, 648, 652 ],context: '',weaponInfo: { dps: 469.1667,weaponSpeed: 1.8,damage: { exactMax: 1098, exactMin: 591, max: 1099, min: 591 } },armor: 0,stats: [ { amount: 96, stat: 59 },{ amount: 96, stat: 36 },{ amount: 216, stat: 7 },{ amount: 144, stat: 3 } ],tooltipParams: { timewalkerLevel: 100,upgrade: { itemLevelIncrement: 10, total: 2, current: 2 },enchant: 5331 },itemLevel: 705,quality: 4,icon: 'inv_knife_1h_draenorcrafted_d_01_b_horde',name: 'Baleful Dagger of the Deft', id: 124627 }
  		var weaponId = 124627

	})
})