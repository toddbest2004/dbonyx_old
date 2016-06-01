var express = require('express');
var bodyParser = require('body-parser');
var db = require('./mongoose');
var path = require('path');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var strategies = require('./config/strategies.js')

var app = express();

var phantom = require('phantom')
var trackedBots = ['googlebot']

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(strategies.serializeUser)
passport.deserializeUser(strategies.deserializeUser)
passport.use(strategies.localStrategy)
passport.use(strategies.jwtStrategy)

var apiCtrl = require("./api/")
app.use("/api", apiCtrl)

app.get('/robots.txt', function(req, res){
	res.sendFile(path.join(__dirname,'public/robots.txt'))
})

app.get('/', function(req, res){
// console.log(req.query)
// console.log('asdf')
	if(req.query._escaped_fragment_===''){
		req.query._escaped_fragment_='/'
	}
	if(req.query._escaped_fragment_){
		phantom.create().then(function(ph) {
		  ph.createPage().then(function(page) {
		    page.open('https://www.dbonyx.com'+req.query._escaped_fragment_).then(function(status) {
		      console.log(status);
		      page.property('content').then(function(content) {
		        // console.log(content);
		        res.send(content)
		        page.close();
		        ph.exit();
		      });
		    });
		  });
		});
	}else{
		res.sendFile(path.join(__dirname, 'public/index.html'))
	}
})
app.use(express.static(path.join(__dirname, 'public')))
app.get('/*', function(req,res){
	res.sendFile(path.join(__dirname, 'public/index.html'))
})



var port = process.env.PORT || 3000;
var serverip = process.env.IP || "localhost";

app.listen(port, serverip);
console.log('Server running at '+serverip+":"+port);


