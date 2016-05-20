var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');
var db = require("../mongoose");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var characterCtrl = require("./controllers/character")
router.use("/character", characterCtrl);
var auctionCtrl = require("./controllers/auction")
router.use("/auction", auctionCtrl);
var battlepetCtrl = require("./controllers/battlepets")
router.use("/battlepet", battlepetCtrl)
var forumCtrl = require('./controllers/forums')
router.use("/forum", forumCtrl);
var itemCtrl = require("./controllers/item")
router.use("/item", itemCtrl);
var mountCtrl = require("./controllers/mount")
router.use("/mount", mountCtrl)
var userCtrl = require("./controllers/user")
router.use("/user", userCtrl)
var watchlistCtrl = require("./controllers/watchlist")
router.use("/watchlist", watchlistCtrl)

router.get("/realms", function(req, res){
	db.realm.find({}, function(err, realms){
		var realmArray = realms.map(function(realm){return realm.name+'-'+realm.region.toUpperCase()})
		res.json(realmArray)
	})
})

module.exports = router;