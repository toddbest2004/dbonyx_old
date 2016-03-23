var express = require("express");
var router = express.Router();
var db = require('../../mongoose')
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy
var transporter = require('../../config/email.js')

router.get("/getUser", function(req, res){
	if(req.session.username&&req.session.email){
		res.json({username:req.session.username,email:req.session.email})
		return
	}
	res.status(401).json({error:"User not logged in."})
	return 
})

router.post("/login", function(req, res){
	console.log(req.body)
	passport.authenticate('local', function(err, user, info) {
		if (user) {
	  		req.login(user, function(err) {
				if (err) throw err
				// req.session.username=user.username
				// req.session.email=user.email
				res.json({username:req.user.username,email:req.user.email})
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
	console.log(req.body)
	if(!req.body.username||!req.body.email||!req.body.password1||!req.body.password2){
		res.status(401).json({error:"Missing one or more requried fields"})
		return
	}
	if(req.body.password1.length<8||req.body.password2.length<8){
		res.status(401).json({error:"Passwords must be at least 8 characters."})
		return
	}
	if(req.body.password1!==req.body.password2){
		res.status(401).json({error:"Passwords do not match."})
		return
	}
	if(!validateEmail(req.body.email)){
		res.status(401).json({error:"Not a valid email address."})
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
			var validationString = makeRandomString()
			db.onyxUser.create({
				username:req.body.username, 
				email:req.body.email, 
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
					from: 'mmofount@gmail.com',
					to: newUser.email,
					subject: 'Welcome to DBOnyx!',
					html: '<a href="http://www.dbonyx.com/validate/'+newUser.username+'/'+validationString+'">Click here to validate your email</a>'
				}
				transporter.sendMail(testMail, function(err, response){
					res.json({username:req.body.username, email:req.body.email})
				})
			})
		})
	})
})

router.post('/validate', function(req, res){
	if(!req.body.username||!req.body.validateString||typeof(req.body.username)!=='string'||typeof(req.body.validateString)!=='string'){
		res.status(401).json({error:"Missing credentials"})
		return
	}
	db.onyxUser.findOne({username:req.body.username}, function(err, user){
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