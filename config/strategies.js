var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var db = require('./../mongoose');
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: process.env.JWT_SECRET
};

module.exports = {
	localStrategy: new LocalStrategy({
	  usernameField: 'email'
	},
	function(email, password, done) {
    email = email.toLowerCase()
	  db.onyxUser.findOne({email: email}).select('+password +email').exec(function(err, user) {
  		if (!err&&user) {
  		  user.comparePassword(password, function(err, result) {
    			if (err) return done(err)
    			if (result) {
    			  done(null, user)
    			} else {
    			  done(null, false, {message: 'Invalid password'})
    			}
  		  })
  		} else {
  		  done(null, false, {message: 'Unknown user'})
  		}
  	})
	}),
  serializeUser: function(user, done) {
    done(null, user._id)
  },
  deserializeUser: function(id, done) {
    db.onyxUser.findOne({_id:id}).then(function(user) {
      done(null, user)
    }).catch(done)
  },
  jwtStrategy: new JwtStrategy(opts, function(jwt_payload, done){
    db.onyxUser.findOne({email: jwt_payload.email}).select('+email').exec(function(err, user){
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  })
}