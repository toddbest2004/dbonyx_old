var LocalStrategy = require('passport-local').Strategy
var db = require('./../mongoose')

module.exports = {
	localStrategy: new LocalStrategy({
	  usernameField: 'email'
	},
	function(email, password, done) {
	  db.onyxUser.findOne({email: email}).exec(function(err, user) {
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
  }
}