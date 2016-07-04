var request = require("request");
var db = require('../mongoose')
var base_url = 'http://'+process.env.IP+':'+process.env.PORT

describe("Forums", function(){
	var validated1, validated2, unvalidated, admin

	//create test users
	beforeAll(function(done){
		db.onyxUser.create({
			username:"validated1",
			password:"validated1",
			email:"validated1@validated.com",
			isEmailValidated:true
		}, function(err, validated1){	
			db.onyxUser.create({
				username:"validated2",
				password:"validated2",
				email:"validated2@validated.com",
				isEmailValidated:true
			}, function(err, validated2){	
				db.onyxUser.create({
					username:"unvalidated",
					password:"unvalidated",
					email:"unvalidated@validated.com",
					isEmailValidated:false
				}, function(err, unvalidated){	
					db.onyxUser.create({
						username:"admin",
						password:"admin",
						email:"admin@validated.com",
						isEmailValidated:true,
						userLevel:1
					}, function(err, admin){	
						done()
					})
				})
			})
		})
	})

	beforeAll(function(done){
		request.post({url:base_url+"/api/user/login", form:{email:'validated1@validated.com', password:'validated1'},json:true}, function(err, response, body){
			validated1 = body.token
			request.post({url:base_url+"/api/user/login", form:{email:'validated2@validated.com', password:'validated2'},json:true}, function(err, response, body){
				validated2 = body.token
				request.post({url:base_url+"/api/user/login", form:{email:'unvalidated@validated.com', password:'unvalidated'},json:true}, function(err, response, body){
					unvalidated = body.token
					request.post({url:base_url+"/api/user/login", form:{email:'admin@validated.com', password:'admin'},json:true}, function(err, response, body){
						admin = body.token
						done()
					})
				})
			})
		})
	})
	//remove test users
	afterAll(function(done){
		db.onyxUser.remove({username:{$in:['Validated1','Validated2','Unvalidated','Admin']}}, function(err){
			done()
		})
	})

	describe("Categories", function(){
		it("should allow admins to create categories", function(done){
			request.post({url:base_url+"/api/forum/category", form:{name:"top category"},headers:{Authorization: "JWT "+admin}}, function(err, response, body){
				done()
			})
		})
	})

	describe("Creating a post", function(){
		it("should allow validated users to post", function(done){
			done()
		})
	})
})