var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/:id", function(req, res){
	var id = parseInt(req.params.id)
	if(!id){
		res.status(400).send({error:"Invalid id."})
		return
	}
	db.item.findOne({_id:id}, function(err, item){
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