'use strict';
var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var realmUtil = require("./util/realmUtil");
var realmArray = realmUtil.realmArray;

router.use("/achievements", require("./controllers/achievements"));
router.use("/auction", require("./controllers/auction"));
router.use("/battlepet", require("./controllers/battlepets"));
router.use("/character", require("./controllers/character"));
// router.use("/data", require("./controllers/data"));
router.use("/forum", require('./controllers/forums'));
router.use("/guild", require("./controllers/guild"));
router.use("/item", require("./controllers/item"));
router.use("/mount", require("./controllers/mount"));
router.use("/quest", require("./controllers/quest"));
router.use("/user", require("./controllers/user"));
router.use("/watchlist", require("./controllers/watchlist"));

router.get("/realms", function(req, res) {
	res.json(realmArray);
});


// // var _page

// router.get("/test", function(req, res){
// 	if(req.query.test===''){
// 		// _page.load('http://google.com')
// 		res.send('1')

// 	}else{
// 		res.send('other')
// 	}
// })

module.exports = router;