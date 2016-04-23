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

var testMail = {
	from: 'admin@dbonyx.com',
	to: process.env.EMAIL_TEST_ADDRESS,
	subject: 'Welcome to DBOnyx!',
	html: '<a href="http://www.dbonyx.com/validate/">Click here to validate your email</a>'
}
transporter.sendMail(testMail, function(err, response){
	console.log(err, response)
})

module.exports = transporter