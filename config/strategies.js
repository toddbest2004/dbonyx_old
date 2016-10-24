"use strict";
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var mysql = require("../mysql");
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: process.env.JWT_SECRET
};

module.exports = {
	localStrategy: new LocalStrategy({
	  usernameField: 'email'
	},
	function(email, password, done) {
    email = email.toLowerCase();
    mysql.UserCredentials.where({email:email}).fetch({withRelated:["user"]}).then(function(credentials) {
      if (!credentials) {
        done(null, false, {message: "Unknown user"});
        return;
      }
      credentials.comparePassword(password, function(err, result) {
        if (err) return done(err);
        if (result) {
          done (null, credentials.toJSON());
        } else {
          done(null, false, {message: "Invalid password"});
        }
      });
    }).catch(function() {
      done(null, false, {message: "Unknown user"});
      return;
    });
	}),
  serializeUser: function(user, done) {
    done(null, user.id);
  },
  deserializeUser: function(id, done) {
    mysql.User.where({id:id}).then(function(user) {
      done(null, user.toJSON());
    }).catch(done);
  },
  jwtStrategy: new JwtStrategy(opts, function(jwt_payload, done) {
    mysql.UserCredentials.where({email: jwt_payload.email}).fetch({withRelated:["user"]}).then(function(credentials) {
      if (credentials) {
        credentials = credentials.toJSON();
        if(credentials.user.username === jwt_payload.username) {
          done(null, credentials.user);
        } else {
          done(null, false);
        }
      } else {
        done(null, false);
      }
    });
  })
};