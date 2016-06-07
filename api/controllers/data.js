var express = require("express");
var router = express.Router();
var passport = require("passport")
var db = require('../../mongoose')
var multer = require('multer')
var memStorage = multer.memoryStorage()
var maxSize = 1024*1024
var upload = multer({storage:memStorage, limits:{fileSize:maxSize}}).single('importFile')


router.post("/import", function(req, res, next){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			upload(req, res, function(err){
				if(err){
					if(err.code==="LIMIT_FILE_SIZE"){
						return res.status(413).json({"error":"File size too large."})
					}
					return res.status(400).json({"error":"Unknown error importing file."})
				}
				try{
					var processString = req.file.buffer.toString('ascii')
					var obj = JSON.parse(processString.slice(processString.indexOf('"'),processString.lastIndexOf('"')+1))

					obj = JSON.parse(obj)
					// console.log(s)
					// var obj = JSON.parse(s)
					// console.log(obj)
					processObject(obj)
				}catch(e){
					console.log(e)
					return res.status(400).json({"error":"Unable to parse import file."})
				}
				res.json({result:'success'})
				
			})
			
	  	} else {
	  		res.status(401).json({error:"You must be logged in to import data."})
		}
	})(req, res)
})

module.exports = router

function processObject(obj){
	// console.log(obj.units)
	for(var key in obj){
		console.log(key)
	}
	processUnits(obj.units)
}

function processUnits(units){
	for(key in units){
		var id
		var unit = units[key]
		var insertUnit = {}
		insertUnit._id = parseInt(key)||0
		insertUnit.sex = parseInt(unit.sex)
		insertUnit.name = typeof(unit.name)==='string'?unit.name:''
		insertUnit.classification = typeof(unit.classification)==='string'?unit.classification:''
		insertUnit.creaturetype = typeof(unit.creaturetype)==='string'?unit.creaturetype:''
		insertUnit.class = typeof(unit.class)==='string'?unit.class:''
		insertUnit.pvp = unit.pvp?true:false
		// insertUnit.reactionAlliance = parseInt(unit.reactionAlliance)
		// insertUnit.reactionHorde = parseInt(unit.reactionHorde)
		insertUnit.level = parseInt(unit.level)
		db.npc.findOneAndUpdate({_id:insertUnit._id},{$set:insertUnit},{upsert:true}).exec(function(err, npc){
		})
	}
}

function processEvents(events){

}

function processQuests(quets){

}

function processProfessions(profs){

}

function processMerchants(merch){

}