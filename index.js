var express = require('express');
var bodyParser = require('body-parser');
var db = require('./mongoose');
var session = require('express-session');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/static'));

app.use(session({
  secret:'3da6f15641a9a688457d114185f91ea907b4f7d5f793770baf5ae',
  resave: false,
  saveUninitialized: true
}));

var apiCtrl = require("./api/")
app.use("/api", apiCtrl)

var port = process.env.PORT || 3000;
var serverip = process.env.IP || "localhost";

app.listen(port, serverip);
console.log('Server running at '+serverip+":"+port);