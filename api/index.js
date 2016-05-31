var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');
var db = require("../mongoose");

var phantom = require('phantom')

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

// var _page

router.get("/test", function(req, res){
	if(req.query.test===''){
		// _page.load('http://google.com')
		res.send('1')

	}else{
		res.send('other')
	}
})
		phantom.create(['--ignore-ssl-errors=yes']).then(function(ph){
			ph.createPage().then(function(page){
				// var testVar = phInstance.createOutObject()
				// testVar.test='1'
				// page.property('onResourceRequested', function(requestData,networkRequest,out){
					page.open('//localhost:8080/api/battlepet/',function(status){

						// console.log(page.content) 
					})
				// }).then(function(){
					ph.exit()
				// })
			})
		})
module.exports = router;