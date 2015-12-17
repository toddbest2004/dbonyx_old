var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser');
var db = require("../mongoose");

router.use(bodyParser.urlencoded({extended: false}));


// var characterCtrl = require("./controllers/character")
// router.use("/character", characterCtrl);

module.exports = router;