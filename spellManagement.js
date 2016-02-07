var request = require("request");
var db = require('./mongoose');
var async = require("async");

var startCount = 0
var myCount = 0
var intervalId = 0
var increment = 80

var knownTags = ['id', 'name','icon','description','powerCost','castTime','range','cooldown', 'subtext']

var spellQueue = async.queue(function(task, callback){
	insertSpell(task.body, callback)
})


// findItems()

db.spell.findOne({}).sort({_id:-1}).exec(function(err, count){
	console.log(count)
	startCount=0
	if(count){
		startCount = count._id
	}
	myCount = startCount
	setTimer()
})

function setTimer(){
	intervalId = setInterval(function(){findSpells()}, 1100)
}

function findSpells(){
	for(var i=myCount; i<(myCount+increment);i++){
	 	findSpell(i)
	}
	myCount+=increment
	if(myCount > startCount + 10000){
		clearInterval(intervalId)
	}
}

function findSpell(id){
	//console.log("loading")
	var url = "https://us.api.battle.net/wow/spell/"+id+"?locale=en_US&apikey="+process.env.API
	
	// console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			spellQueue.push({body:body}, function(){console.log("")})
		}else{
			// console.log(response.statusCode)
		}
	})	
}

function insertSpell(body, callback){
	// console.log("****"+body.id)
	db.spell.findOne({_id:body.id}).exec(function(err, spell){
		if(err){
			console.log(err)
			return callback()
		}
		if(!spell){
			db.spell.create({_id:body.id}, function(err, spell){
				for(key in body){
					if(knownTags.indexOf(key)===-1){
						console.log(key)
					}
					spell[key]=body[key]
				}
				spell.save(function(err){
					console.log("saved")
					if(err){
						console.log(err)
					}
					// console.log(spell)
					callback()
				})
			})
		}else{
			callback()
			// console.log(spell)
		}
	})
}