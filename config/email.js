var nodemailer = require('nodemailer')

//http://masashi-k.blogspot.com/2013/06/sending-mail-with-gmail-using-xoauth2.html
// var transporter = nodemailer.createTransport("SMTP", {
//   service: "Gmail",
//   auth: {
//     XOAuth2: {
// 	    user: "DBOnyx",
// 	    clientId: "699222962515-4per0krvgqfehfm0tqitg2v8aou3e189.apps.googleusercontent.com",
// 	    clientSecret: "EqHkIvsflsWy4LSVMQc6VKV8",
// 	    refreshToken: '1/ozR9bkqB8E6rFCMxvBYgZXld3vEjRFxQ3tkyefuEg10'
//     }
//   }
// });

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

// var testMail = {
// 	from: 'admin@dbonyx.com',
// 	to: process.env.EMAIL_TEST_ADDRESS,
// 	subject: 'Welcome to DBOnyx!',
// 	html: '<a href="http://www.dbonyx.com/validate/">Click here to validate your email</a>'
// }
// transporter.sendMail(testMail, function(err, response){
// 	console.log(err, response)
// })

module.exports = transporter