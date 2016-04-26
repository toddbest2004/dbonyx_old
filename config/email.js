var nodemailer = require('nodemailer')

var xoauth2 = require('xoauth2');
 
// login 
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
		    user: process.env.EMAIL_CLIENT_USER,
		    clientId: process.env.EMAIL_CLIENT_ID,
		    clientSecret: process.env.EMAIL_CLIENT_SECRET,
		    refreshToken: process.env.EMAIL_REFRESH_TOKEN
        })
    }
});


module.exports = transporter