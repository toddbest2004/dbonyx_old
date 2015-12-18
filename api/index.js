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

module.exports = router;