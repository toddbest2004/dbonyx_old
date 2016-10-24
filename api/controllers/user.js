"use strict";
var express = require("express");
var router = express.Router();
var mysql = require("../../mysql");
var passport = require("passport");
var transporter = require('../../config/email.js');
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;

router.post("/getUser", passport.authenticate('jwt', {session: false}),function(req, res){
	if(req.user){
		res.json({username:req.user.username});
		return;
	}
	res.status(401).json({error:"User not logged in."});
	return;
});

router.post("/login", function(req, res){
	passport.authenticate('local', function(err, credentials) {
		if (credentials) {
			var token = jwt.sign({email:credentials.email,username:credentials.user.username}, secret);
			res.send({
				username: credentials.user.username,
				token: token
			});
  		} else {
	  		res.status(401).json({error:"Incorrect email/password combination."});
		}
	})(req, res);
});

router.post("/logout", function(req, res) {
	req.session.destroy();
	res.send({result:"Logout successful."});
});

router.post("/register", function(req, res) {
	if (!req.body.username||!req.body.email||!req.body.password1||!req.body.password2){
		res.status(401).json({error:"Missing one or more required fields."});
		return;
	}
	if (req.body.password1!==req.body.password2) {
		res.status(401).json({error:"Passwords do not match."});
		return;
	}
	if (req.body.password1.length<8||req.body.password2.length<8) {
		res.status(401).json({error:"Passwords must be at least 8 characters."});
		return;
	}
	if (!validateEmail(req.body.email)) {
		res.status(401).json({error:"Not a valid email address."});
		return;
	}
	var password = req.body.password1;
	var validCharacters = /^[a-z][a-z0-9_\-]*$/i;
	if (!validCharacters.test(req.body.username)) {
		res.status(401).json({error:"Invalid username. Name must start with a letter and can only contain letters, numbers and - and _"});
		return;
	}
	var email = req.body.email.toLowerCase();
	var username = req.body.username.capitalize();
	new Promise(function(resolve, reject) {
		isUsernameAvailable(username).then(function(available) {
			if (!available) {
				return reject("Username already in use");
			}
			isEmailAvailable(email).then(function(available) {
				if (!available) {
					return reject("Email already in use");
				}
				createUser(username, email, password).then(function(returnData) {
					var credentials = returnData.credentials,
						username = returnData.username;
					sendValidationEmail(credentials, username).then(function() {
						resolve(credentials, username);
					}).catch(reject);
				}).catch(reject);
			}).catch(reject);
		}).catch(reject);
	}).then(function(credentials, username) {
		res.json({username:username, email:credentials.attributes.email});
	}).catch(function(err){userCreationError(err, res);});
});

router.post('/validate', function(req, res){
	if(!req.body.username||!req.body.validateString||typeof(req.body.username)!=='string'||typeof(req.body.validateString)!=='string'){
		res.status(401).json({error:"Missing credentials."});
		return;
	}
	mysql.User.where({username:req.body.username}).fetch({withRelated:["credentials"]}).then(function(user) {
		if(!user) {
			return res.status(401).json({error:"Unable to verify credentials."});
		}
		var credentials = user.relations.credentials;
		var validationDate = new Date(credentials.attributes.emailValidationCreatedDate);
		var now = new Date();
		var oneDay = 1000 * 60 * 60 * 24;
		if (now-validationDate > oneDay) {
			return res.status(401).json({error:"Unable to verify credentials."});
		}
		if (credentials.attributes.emailValidation === req.body.validateString) {
			credentials.set({emailValidationDate:now, isEmailValidated: true});
			credentials.where({email:credentials.attributes.email}).save(null, {method: "update"}).then(function(updated) {
				if (updated) {
					return res.json({result:"Success"});
				}
				return res.status(401).json({error:"Unable to verify credentials."});
 			}).catch(function() {
				return res.status(401).json({error:"Unable to verify credentials."});
 			});
		} else {
			return res.status(401).json({error:"Unable to verify credentials."});
		}
	});
});

router.post('/feedback', function(req, res){
	var title = req.body.title;
	var message = req.body.message;
	var feedbackMail = {
		from: 'admin@dbonyx.com',
		to: 'admin@dbonyx.com',
		subject: 'DB Onyx Feedback Received',
		html: '<div>Title: '+title+'</div><div>Message: '+message+'</div>'
	};
	transporter.sendMail(feedbackMail, function(){
		res.json({success:true});
	});
});

router.get('/publicProfile', function(req, res){
	if(!req.query.username||typeof(req.query.username)!=='string'){
		return res.status(401).json({error:"Unable to read username."});
	}
	mysql.User.where({username:req.query.username}).fetch().then(function(user) {
		res.json(user);
	});
});

router.get('/privateProfile', function(req, res){
	passport.authenticate('jwt', function(err, user) {
		if (user) {
			// db.forumPost.find({author:user._id}).populate("thread").exec(function(err, posts) {
			// 	if(err) {
			// 		return res.status(401).json({error:"Error fetching user data"});
			// 	}
				res.json({user:user});
			// });
  		} else {
	  		res.status(401).json({error:"Unable to verify user. Please try re-logging in."});
		}
	})(req, res);
});

module.exports = router;

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function makeRandomString(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for ( var i=0; i < 40; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function isUsernameAvailable(username) {
	return new Promise(function(resolve, reject) {
		mysql.User.where({username:username}).fetch().then(function(user) {
			if (user) {
				resolve(false);
				return;
			}
			resolve(true);
		}).catch(function(err) {
			reject(err);
		});
	});
}

function isEmailAvailable(email) {
	return new Promise(function(resolve, reject) {
		mysql.UserCredentials.where({email:email}).fetch().then(function(email) {
			if (email) {
				resolve(false);
				return;
			}
			resolve(true);
		}).catch(function(err) {
			reject(err);
		});
	});
}

function userCreationError(err, res) {
	console.log(err);
	res.status(401).json({error: "There was an error creating your account."});
}

function createUser(username, email, password) {
	var validationString = makeRandomString();
	return new Promise(function(resolve, reject) {
		mysql.User.forge({username:username}).save().then(function(newUser) {
			var newUserId = newUser.attributes.id;
			var now = new Date();
			mysql.UserCredentials.forge({
				user_id:newUserId,
				email: email,
				emailValidation: validationString,
				isEmailValidated: false,
				emailValidationCreatedDate: now,
				userCreatedDate: now,
				password: password //will be encrypted by bcrypt and 'onsave'
			}).save().then(function(credentials) {
				resolve({credentials:credentials, username:username});
			}).catch(function(err) {
				reject(err);
			});
		}).catch(function(err) {
			reject(err);
		});
	});
}

function sendValidationEmail(credentials, username) {
	return new Promise(function(resolve, reject) {
		credentials = credentials.toJSON();
		if (credentials.email === "testemail@dbonyx.com") {
			return resolve();
		} else {
			var testMail = {
				from: 'admin@dbonyx.com',
				to: credentials.email,
				subject: 'Welcome to DBOnyx!',
				html: '<a href="http://www.dbonyx.com/validate/'+username+'/'+credentials.emailValidation+'">Click here to validate your email</a>'
			};
			transporter.sendMail(testMail, function(err) {
				if(err) {
					return reject();
				}
				resolve();
			});
		}
	});
}