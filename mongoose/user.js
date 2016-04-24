var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

function capitalize (v) {
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}

function toLower (v) {
  return v.toLowerCase();
}

var onyxUserSchema = new Schema({
	username: {type: String,required:true, set: capitalize},
	password: {type: String, required: true},
	email: {type: String, set: toLower, requied: true},
	emailValidation: String,
	isEmailValidated: {type:Boolean, default:false},
	emailValidationCreatedDate: {type:Date, default: Date.now},
	emailValidatedDate: Date,
	userCreatedDate: {type:Date, default: Date.now}
})

onyxUserSchema.pre('save', function(next) {
    var onyxUser = this;
	// only hash the password if it has been modified (or is new)
	if (!onyxUser.isModified('password')) return next();
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);
	    // hash the password using our new salt
	    bcrypt.hash(onyxUser.password, salt, function(err, hash) {
	        if (err) return next(err);
	        // override the cleartext password with the hashed one
	        onyxUser.password = hash;
	        next();
	    });
	});
});

onyxUserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var onyxUser = mongoose.model('onyxUser', onyxUserSchema)
module.exports = onyxUser

// User Password check example
// onyxUser.comparePassword(req.body.password, function(err, isMatch) {
// 	if (err||!isMatch){
// 		res.status(404).send({result:false,error:"Username/password not found."})
// 	}
// 	req.session.onyxUsername=onyxUser.onyxUsername
// 	res.send({result:true})
// });