var request = require("request");
var db = require('../mongoose')
var base_url = 'http://'+process.env.IP+':'+process.env.PORT


describe("Registration ", function() {
	beforeAll(function(done){
		db.onyxUser.findOneAndRemove({username:"Testuser"}, function(){
			db.onyxUser.findOneAndRemove({email:"testemail@dbonyx.com"}, function(){
				done()
			})
		})
	})

	describe("User", function(){
		describe("User login, user doesn't exist", function(){
			it("Cannot log in to account that does not exist.", function(done){
				request.post({url:base_url+"/api/user/login", form:{email:'testemail@dbonyx.com', password:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Incorrect email/password combination."})
					done()
				})
			})
			it("Does not accept empty fields", function(done){
				request.post({url:base_url+"/api/user/login", form:{},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Incorrect email/password combination."})
					done()
				})
			})
			it("Does not accept empty password", function(done){
				request.post({url:base_url+"/api/user/login", form:{email:'testemail@dbonyx.com'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Incorrect email/password combination."})
					done()
				})
			})
			it("Does not accept empty email", function(done){
				request.post({url:base_url+"/api/user/login", form:{password:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Incorrect email/password combination."})
					done()
				})
			})
		})
		describe("Bad user registration", function(){
			it("Should not create account without username", function(done){
				request.post({url:base_url+"/api/user/register", form:{email:'testemail@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Missing one or more required fields."})
					done()
				})
			})
			it("Should not create account without email", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Missing one or more required fields."})
					done()
				})
			})
			it("Should require matching passwords", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser',email:'testemail@dbonyx.com', password1:'qwerqwer', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Passwords do not match."})
					done()
				})
			})
			it("Should not accept passwords length < 8", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser',email:'testemail@dbonyx.com', password1:'asdfasd', password2:'asdfasd'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Passwords must be at least 8 characters."})
					done()
				})
			})
			it("Should not accept non-alphanumeric (and _ and -) characters for username", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser\\',email:'testemail@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:"Invalid username. Name must start with a letter and can only contain letters, numbers and - and _"})
					done()
				})
			})
			it("Should not have created an account with username Testuser.", function(done){	
				db.onyxUser.findOne({username:"Testuser"}).exec(function(err, user){
					expect(err).toBeNull()
					expect(user).toBeNull()
					done()
				})
			})
			it("Should not have created an account with username Testuser\\.", function(done){	
				db.onyxUser.findOne({username:"Testuser\\"}).exec(function(err, user){
					expect(err).toBeNull()
					expect(user).toBeNull()
					done()
				})
			})
			it("Should not have created an account with email testemail@dbonyx.com", function(done){
				db.onyxUser.findOne({email:"testemail@dbonyx.com"}).exec(function(err, user){
					expect(err).toBeNull()
					expect(user).toBeNull()
					done()
				})
			})
		})
		describe("Good user registration", function(){
			it("Should create account with proper elements", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser',email:'testemail@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(200)
					expect(body.username).toEqual('Testuser')
					expect(body.email).toEqual('testemail@dbonyx.com')
					done()
				})
			})
		})
		describe("Registering an account that already exists", function(){
			it("account should exist", function(done){
				db.onyxUser.findOne({email:"testemail@dbonyx.com"}).exec(function(err, user){
					expect(err).toBeNull()
					expect(user).not.toBeNull()
					done()
				})
			})
			it("should not allow creation of account with same email", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser2',email:'testemail@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:'Email already in use.'})
					done()
				})
			})
			it("should not allow creation of account with same name", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testuser',email:'testemail2@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:'Username already in use.'})
					done()
				})		
			})
			it("should not allow creation of account with same name, case insensitive", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testUser',email:'testemail2@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:'Username already in use.'})
					done()
				})		
			})
			it("should not allow creation of account with same email, case insensitive", function(done){
				request.post({url:base_url+"/api/user/register", form:{username:'testUser2',email:'testEmail@dbonyx.com', password1:'asdfasdf', password2:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body).toEqual({error:'Email already in use.'})
					done()
				})		
			})
		})
		describe("User login, user does exist", function(){
			it("should let user log in", function(done){
				request.post({url:base_url+"/api/user/login", form:{email:'testemail@dbonyx.com', password:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(200)
					expect(body.username).toEqual('Testuser')
					expect(body.token).not.toBeFalsy()
					done()
				})		
			})
			it("should let user log in, case insensitive email", function(done){
				request.post({url:base_url+"/api/user/login", form:{email:'testEmail@dbonyx.com', password:'asdfasdf'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(200)
					expect(body.username).toEqual('Testuser')
					expect(body.token).not.toBeFalsy()
					done()
				})		
			})
			it("should not accept incorrect password", function(done){
				request.post({url:base_url+"/api/user/login", form:{email:'testEmail@dbonyx.com', password:'qwerqwer'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body.username).toBeFalsy()
					expect(body.token).toBeFalsy()
					expect(body.error).toBe("Incorrect email/password combination.")
					done()
				})	
			})
		})
		describe("User email validation", function(){
			var validateString;
			beforeAll(function(done){
				db.onyxUser.findOne({email:"testemail@dbonyx.com"}).select("+emailValidation").exec(function(err, user){
					validateString = user.emailValidation
					done()
				})
			})
			it("Should require a username", function(done){
				request.post({url:base_url+"/api/user/validate", form:{validateString:validateString},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body.error).toBe("Missing credentials.")
					done()
				})	
			})
			it("Should require a validateString", function(done){
				request.post({url:base_url+"/api/user/validate", form:{username:'Testuser'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body.error).toBe("Missing credentials.")
					done()
				})	
			})
			it("Should not accept an incorrect validateString", function(done){
				request.post({url:base_url+"/api/user/validate", form:{username:'Testuser', validateString:validateString+'wrong'},json:true}, function(err, response, body){
					expect(response.statusCode).toEqual(401)
					expect(body.error).toBe("Incorrect validation string.")
					done()
				})		
			})
		})
	})
});


