var itemConstants = {}

itemConstants.inventoryTypes=['None','Head','Neck','Shoulder','Shirt','Chest','Waist','Pants','Feet','Wrist','Hands','Finger','Trinket','One-handed Weapon','Shield','Bow','Back','Two-handed Weapon','Bag','Tabard','Chest','Main-hand Weapon','Off-hand Weapon','Held in Off-Hand','Projectile','Thrown','Gun']
itemConstants.itemBinds = ['', 'Binds when picked up', 'Binds when equipped', 'Binds when used','']
itemConstants.classes = [
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

itemConstants.bonusStatClasses = ['itemUnusedProperty', 'itemPrimaryProperty','itemSecondaryProperty']
itemConstants.bonusStats = {
	0: {name: 'Unused', class: 0},
	1: {name: 'Health', class: 0},
	3: {name: 'Agility', class: 1},
	4: {name: 'Strength', class: 1},
	5: {name: 'Intellect', class: 1},
	6: {name: 'Spirit', class: 2},
	7: {name: 'Stamina', class: 1},
	13: {name: 'Dodge', class: 2},
	14: {name: 'Parry', class: 2},
	31: {name: 'Hit', class: 2},
	32: {name: 'Critical Strike', class: 2},
	35: {name: 'PvP Resilience', class: 2},
	36: {name: 'Haste', class: 2},
	38: {name: 'Attack Power', class: 2},
	39: {name: 'Ranged Attack Power', class: 2},
	45: {name: 'Spell Power', class: 2},
	46: {name: 'Health per 5 sec.', class: 2},
	47: {name: 'Spell Penetration', class: 2},
	49: {name: 'Mastery', class: 2},
	50: {name: 'Bonus Armor', class: 2},
	51: {name: 'Fire Resistance', class: 1},
	52: {name: 'Frost Resistance', class: 1},
	54: {name: 'Shadow Resistance', class: 1},
	55: {name: 'Nature Resistance', class: 1},
	56: {name: 'Arcane Resistance', class: 1},
	57: {name: 'PvP Power', class: 2}
}

itemConstants.itemSpellTriggers = {
	ON_PROC:"Chance On Hit",
	ON_EQUIP:"Equip:",
	ON_USE:"Use:",
	ON_PICKUP:"",
	ON_LEARN:""
}
module.exports = itemConstants