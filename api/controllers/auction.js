var express = require("express");
var router = express.Router();

var db = require("../../mongoose");

router.get("/*", function(req, res){
	res.status(404).json({error:"Not Found.", result:false})
})

module.exports = router