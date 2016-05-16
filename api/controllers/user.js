var express = require("express");
var router = express.Router();
var db = require('../../mongoose')
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy
var jwtStrategy = require('passport-jwt').Strategy
var transporter = require('../../config/email.js')
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;

router.post("/getUser", passport.authenticate('jwt', {session: false}),function(req, res){
	if(req.user){
		res.json({username:req.user.username})
		return
	}
	res.status(401).json({error:"User not logged in."})
	return 
})

router.post("/login", function(req, res){
	passport.authenticate('local', function(err, user, info) {
		if (user) {
			var token = jwt.sign({email:user.email,username:user.username}, secret);
			res.send({
				username: user.username,
				token: token
			});
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
	if(!req.body.username||!req.body.email||!req.body.password1||!req.body.password2){
		res.status(401).json({error:"Missing one or more required fields."})
		return
	}
	if(req.body.password1!==req.body.password2){
		res.status(401).json({error:"Passwords do not match."})
		return
	}
	if(req.body.password1.length<8||req.body.password2.length<8){
		res.status(401).json({error:"Passwords must be at least 8 characters."})
		return
	}
	if(!validateEmail(req.body.email)){
		res.status(401).json({error:"Not a valid email address."})
		return
	}
	var validCharacters = /^[a-z][a-z0-9_\-]*$/i
	if(!validCharacters.test(req.body.username)){
		res.status(401).json({error:"Invalid username. Name must start with a letter and can only contain letters, numbers and - and _"})
		return
	}
	var email = req.body.email.toLowerCase()
	db.onyxUser.findOne({email:email}).exec(function(err, userCheck){
		if(err||userCheck){
			res.status(401).json({error:"Email already in use."})
			return
		}
		var username = req.body.username.capitalize()
		db.onyxUser.findOne({username:username}).exec(function(err, user){
			if(err||user){
				res.status(401).json({error:"Username already in use."})
				return
			}
			var validationString = makeRandomString()
			db.onyxUser.create({
				username: username, 
				email:email, 
				password:req.body.password1,
				emailValidation:validationString
			},function(err, newUser){
				console.log("User Created")
				if(err||!newUser){
					res.status(401).json({error:"There was an error creating the account."})
					return
				}
				//Character account successfully created
				var testMail = {
					from: 'admin@dbonyx.com',
					to: newUser.email,
					subject: 'Welcome to DBOnyx!',
					html: '<a href="http://www.dbonyx.com/validate/'+newUser.username+'/'+validationString+'">Click here to validate your email</a>'
				}
				transporter.sendMail(testMail, function(err, response){
					res.json({username:newUser.username, email:newUser.email})
				})
			})
		})
	})
})

router.post('/validate', function(req, res){
	// console.log(req.body.username)
	// console.log(req.body.validateString)
	if(!req.body.username||!req.body.validateString||typeof(req.body.username)!=='string'||typeof(req.body.validateString)!=='string'){
		res.status(401).json({error:"Missing credentials."})
		return
	}
	db.onyxUser.findOne({username:req.body.username}).select("+emailValidation +emailValidationCreatedDate").exec(function(err, user){
		if(err||!user){
			res.status(401).json({error:"User not found."})
			return
		}
		if(user.isEmailValidated){
			res.status(401).json({error:"Email already validated."})
			return
		}
		if(req.body.validateString!==user.emailValidation){
			res.status(401).json({error:"Incorrect validation string."})
			return
		}
		var expiretime = Date.parse(user.emailValidationCreatedDate)+1000*60*60*24 //24 hours
		if(Date.now()>expiretime){
			res.status(401).json({error:"Validation code has expired."})
			return
		}
		user.emailValidation = ''
		user.isEmailValidated = true
		user.emailValidatedDate = Date.now()
		user.save(function(err){
			res.json({result:"Success!"})
		})
	})
})

router.post('/feedback', function(req, res){
	var title = req.body.title
	var message = req.body.message
	var feedbackMail = {
		from: 'admin@dbonyx.com',
		to: 'admin@dbonyx.com',
		subject: 'DB Onyx Feedback Received',
		html: '<div>Title: '+title+'</div><div>Message: '+message+'</div>'
	}
	transporter.sendMail(feedbackMail, function(err, response){
		res.json({success:true})
	})
})

router.get('/publicProfile', function(req, res){
	if(!req.query.username||typeof(req.query.username)!=='string'){
		return res.status(401).json({error:"Unable to read username."})
	}
	db.onyxUser.findOne({username:req.query.username.capitalize()}).exec(function(err, user){
		res.json(user)
	})
})

router.get('/privateProfile', function(req, res){
	passport.authenticate('jwt', function(err, user, info) {
		if (user) {
			res.send(user)
  		} else {
	  		res.status(401).json({error:"Unable to verify user. Please try re-logging in."})
		}
	})(req, res)
})

module.exports = router

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
}

function makeRandomString(){
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for( var i=0; i < 40; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    return text
}