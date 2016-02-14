var express = require("express");
var router = express.Router();
var db = require('../../mongoose')
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy

router.get("/getUser", function(req, res){
	if(req.session.username&&req.session.email){
		res.json({username:req.session.username,email:req.session.email})
		return
	}
	res.status(401).json({error:"User not logged in."})
	return 
})

router.post("/login", function(req, res){
	passport.authenticate('local', function(err, user, info) {
		if (user) {
	  		req.login(user, function(err) {
				if (err) throw err
				req.session.username=user.username
				req.session.email=user.email
				res.json({username:req.session.username,email:req.session.email})
				return
			})
  		} else {
	  		res.status(401).json({error:"Incorrect email/password combination."})
		}
	})(req, res)
})

router.post("/logout", function(req, res){
	req.session.destroy()
	res.send({result:"Logout successful."})
})

router.post("/register", function(req, res){
	if(req.body.password1.length<8||req.body.password2.length<8){
		res.status(401).json({error:"Passwords must be at least 8 characters."})
		return
	}
	if(req.body.password1!==req.body.password2){
		res.status(401).json({error:"Passwords do not match."})
		return
	}
	db.onyxUser.findOne({email:req.body.email}).exec(function(err, userCheck){
		if(err||userCheck){
			res.status(401).json({error:"Email already in use"})
			return
		}
		db.onyxUser.findOne({username:req.body.username}).exec(function(err, user){
			if(err||user){
				res.status(401).json({error:"Username already in use."})
				return
			}
			db.onyxUser.create({username:req.body.username, email:req.body.email, password:req.body.password1},function(err, newUser){
				if(err||!newUser){
					res.status(401).json({error:"There was an error creating the account."})
					return
				}
				res.json({username:req.body.username, email:req.body.email})
			})
		})
	})
})


module.exports = router