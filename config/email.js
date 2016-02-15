var nodemailer = require('nodemailer')
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}
var transporter = nodemailer.createTransport(smtpConfig)

module.exports = transporter