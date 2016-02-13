var express = require("express");
var router = express.Router();
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy

router.post("/login", function(req, res){
	passport.authenticate('local', function(err, user, info) {
		if (user) {
	  		req.login(user, function(err) {
				if (err) throw err;
				res.send('HTTP/1.1 200 OK');
			});
  		} else {
	  		res.send('HTTP/1.1 400 BAD REQUEST');
		};
	})(req, res);
})




module.exports = router