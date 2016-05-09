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

itemConstants.randIds = { //{suffix:"",stats:[]}
	5: {suffix:"of the Monkey", stats:[]},
	7: {suffix:"of the Bear", stats:[4,7]},
	9: {suffix:"of the Owl",stats:[5,6]},
	12: {suffix:"of the Bear",stats:[4,7]},//Strength, Stam
	13: {suffix:"of the Wolf",stats:[3,6]},//: Agi, Spirit
	14: {suffix:"of the Tiger",stats:[3,32]},//: Agi, Crit
	16: {suffix:"of the Boar",stats:[4,6]},//: Strength, Spirit
	17: {suffix:"of Strength",stats:[4]},//: Strength
	19: {suffix:"of Intellect",stats:[5]},//: Int
	20: {suffix:"of Power",stats:[38]},//: Attack Power
	21: {suffix:"of Intellect",stats:[5]},//: Int
	22: {suffix:"of Intellect",stats:[5]},//of Intellect: Int
	23: {suffix:"of Intellect",stats:[5]},//of Intellect: Int
	24: {suffix:"of Intellect",stats:[5]},//of intellect: Int
	25: {suffix:"of Intellect",stats:[5]},//int
	26: {suffix:"of Intellect",stats:[5]},//of Intellect: Int
	27: {suffix:"of Nimbleness",stats:[13]},//: Dodge
	28: {suffix:"of Stamina",stats:[7]},//: Stam
	29: {suffix:"of Eluding",stats:[3,13]},//: Agi, Dodge
	30: {suffix:"of Spirit",stats:[6]},//: Spirit
	31: {suffix:"of Arcane protection",stats:[7,56]},//: Stam, Arcane Resist
	32: {suffix:"of Fire Protection",stats:[7,51]},//: Stam, Fire Resist
	33: {suffix:"of Frost Protection",stats:[7,52]},//: Stam, Frost Resist
	34: {suffix:"of Nature Protection",stats:[7,55]},//: Stam, Nature Resist
	35: {suffix:"of Shadow Protection",stats:[7,54]},//: Stam, Shadow Resist
	36: {suffix:"of the Sorcerer",stats:[5,7,36]},//: Int, Stam, Haste
	37: {suffix:"of the Seer",stats:[5,7,32]},//: Int, Stam, Crit
	38: {suffix:"of the Prophet",stats:[5,6,36]},//: Int, Haste, Spirit
	39: {suffix:"of the Invoker",stats:[5,32]},//: Int, Crit
	40: {suffix:"of the Bandit",stats:[3,7,32]},//: Agi, Stam, crit
	41: {suffix:"of the Beast",stats:[7,32,36]},//: Stam, Crit, Haste
	42: {suffix:"of the Elder",stats:[5,7,6]},//: Int, Stam, Spirit
	43: {suffix:"of the Soldier",stats:[4,7,32]},//: Strength, Stam, Crit
	44: {suffix:"of the Elder",stats:[5,6,7]},//: int, Stam, Spirit
	45: {suffix:"of the Champion",stats:[4,7,13]},//: Strength, Stam, Dodge
	47: {suffix:"of Blocking",stats:[4,0]},//: Strength, Block
	56: {suffix:"of the Battle",stats:[4,7,32]},//: Strength, Stam, Crit
	57: {suffix:"of the Shadow",stats:[3,7,32]},//: Agi, Stam, Crit
	58: {suffix:"of the Sun",stats:[5,7,32]},//: int, stam, crit
	59: {suffix:"of the Moon",stats:[5,7,6]},//: Int, stam, spirit
	60: {suffix:"of the Wild",stats:[3,7,36]},//: Agi, Stam, Haste
	67: {suffix:"of the Seer",stats:[5,7,32]},//: int, stam, crit
	69: {suffix:"of the Eagle",stats:[5,7]},//: Int, Stam
	70: {suffix:"of the Monkey",stats:[3,7]},//: Agi Stam
	78: {suffix:"of the Monkey",stats:[3,7]},//: Agility, Stam
	81: {suffix:"of the Whale",stats:[6,7]},//: stam, Spirit
	84: {suffix:"of Stamina",stats:[7]},//: Stam
	88: {suffix:"of the Necromancer",stats:[5,7,36]},//: Int, Stam, Haste
	89: {suffix:"of the Thief",stats:[3,7,36]},//: Agi, Stam, Haste
	90: {suffix:"of the Necromancer",stats:[5,7,36]},//: int, Stam, Haste,
	91: {suffix:"of the Marksman",stats:[3,7,32]},//: Agi, Stam, crit
	93: {suffix:"of Restoration",stats:[5,7,6]},//: Int, Stam, Spirit
	100: {suffix:"of the Principle",stats:[4,7,32,36]},//: Strength, Stam, Crit, Haste
	101: {suffix:"of the Sentinel",stats:[4,7,32,36]},//: Strength, Stam, Crit, haste
	102: {suffix:"of the Hero",stats:[4,7,32,36]},//: Strength, Stame, Crit, Hase
	103: {suffix:"of the Avatar",stats:[4,7,32,49]},//: Strength Stam Crit Mastery
	104: {suffix:"of the Embodiment",stats:[4,7,36,49]},//: Strength, Stam, Haste, Mastery
	106: {suffix:"of the Defender",stats:[4,7,13,14]},//: Strength Stam Dodge Parry
	109: {suffix:"of the Preserver",stats:[5,7,49,6]},//: Int Stam, Mastery, Spirit
	114: {suffix:"of the Flameblaze",stats:[5,7,36,49]},//: int, stam, haste, mastery
	118: {suffix:"of the Faultline",stats:[4,7,36,49]},//: Strength, Stam, Haste, Mastery
	120: {suffix:"of the Earthshaker",stats:[4,7,32,36]},//: strength, stam, crit, haste
	121: {suffix:"of the Landslide",stats:[4,7,32,36]},//: Strength, Stam, Crit haste
	122: {suffix:"of the Earthfall",stats:[4,7,32,36]},//: Strength, Stam, Crit, Haste
	123: {suffix:"of the Earthbreaker",stats:[4,7,32,49]},//: Strength, Stam, Crit, Mastery
	124: {suffix:"of the Mountainbed",stats:[4,7,36,49]},//: Strngth, Stam, Haste, Mastery
	125: {suffix:"of the Bedrock",stats:[4,7,14,49]},//: Strength, Stamina, Parry, Mastery
	127: {suffix:"of the Bouldercrag",stats:[4,7,13,14]},//: Strength, Stam, Dodge, Parry
	128: {suffix:"of the Rockslab",stats:[4,7,13,49]},//: Strength, Stam, Dodge, Mastery
	129: {suffix:"of the Wildfire",stats:[5,7,32,36]},//: Int, stam, crit, haste
	130: {suffix:"of the Fireflash",stats:[5,7,32,36]},//: Int, Stam, Crit, Haste
	131: {suffix:"of the Wavecrest",stats:[5,7,49,6]},//: Int, Stam, Mastery, Spirit
	132: {suffix:"of the wavecrest",stats:[5,7,49,6]},//: Int, Stam, Mastery, Spirit
	133: {suffix:"of the Stormblast",stats:[3,7,32,36]},//: Agi, Stam, Crit, Haste
	134: {suffix:"of the Galeburst",stats:[3,7,32,36]},//: Agi, Stam, Crit, Haste
	135: {suffix:"of the Windflurry",stats:[3,7,32,36]},//: Agi, Stam, crit, Haste
	136: {suffix:"of the Zephyr",stats:[3,7,36,49]},//: Agi, Stam, Haste, Mastery
	137: {suffix:"of the Windstorm",stats:[3,7,32,49]},//: Agi, Stam, Crit, Mastery
	138: {suffix:"of the Feverflare",stats:[5,7,36,49]},//: Int, Stam, Haste, Mastery
	139: {suffix:"of the Mercenary",stats:[4,7,36]},//: Strength, Stam, Haste
	140: {suffix:"of the Wraith",stats:[5,7,32,6]},//: Int, Stam, Crit, Spirit
	141: {suffix:"of the Wind",stats:[5,7,36,6]},//: Int, Stam, Haste, Spirit
	142: {suffix:"of the Master",stats:[49,6]},//: Mastery Spirit
	144: {suffix:"of the Shark",stats:[32,49]},//: Crit, Mastery
	145: {suffix:"of the Panther",stats:[36,49]},//: Haste, Mastery
	147: {suffix:"of the Shark",stats:[32,49]},//: Crit, Mastery
	149: {suffix:"of the Scorpion",stats:[32,36]},//: Crit, Haste (upgrade)
	150: {suffix:"of the Panther",stats:[36,49]},//: Haste, Mastery (upgrade)
	151: {suffix:"of the Wind",stats:[36,6]},//: Haste, Spirit (upgrade)
	152: {suffix:"of the Master",stats:[49,6]},//: Mastery, Spirit (upgrade)
	154: {suffix:"",stats:[]},//of the Shark?
	156: {suffix:"",stats:[]},//Panther or Wraith
	157: {suffix:"of the Panther",stats:[]},//: (upgrade)
	158: {suffix:"of the Wind",stats:[]},//: (upgrade)
}

itemConstants.itemSpellTriggers = {
	ON_PROC:"Chance On Hit",
	ON_EQUIP:"Equip:",
	ON_USE:"Use:",
	ON_PICKUP:"",
	ON_LEARN:""
}
module.exports = itemConstants