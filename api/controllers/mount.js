var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id)
	if(!id){
		res.status(400).json({error:"Improper Query String."})
		return
	}
	db.mount.findOne({_id:id})//.populate('itemId').populate('spellId')
	.exec(function(err, mount){
		if(err||!mount){
			res.status(404).json({error:"Mount not found."})
			return
		}
		console.log(mount)
		res.json({mount:mount})
	})
})

module.exports = router