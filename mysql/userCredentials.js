"use strict";
var bookshelf = require("./database"),
	User = require("./user");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserCredentials = bookshelf.Model.extend({
	tableName: 'user_credentials',
	user: function() {
		return this.belongsTo("User", "user_id");
	},
	initialize: function() {
		this.on('creating', this.hashPassword, this);
	},
	hashPassword: function(model) {
		return new Promise(function(resolve, reject) {
			bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
				if (err) reject(err);
				bcrypt.hash(model.attributes.password, salt, function(err, hash) {
					if( err ) reject(err);
					model.set('password', hash);
					resolve(hash); // data is created only after this occurs
				});
			});
		});
	},
	comparePassword: function(candidatePassword, cb) {
	    bcrypt.compare(candidatePassword, this.attributes.password, function(err, isMatch) {
	        if (err) return cb(err);
	        cb(null, isMatch);
	    });
	}
});

module.exports = bookshelf.model("UserCredentials", UserCredentials);