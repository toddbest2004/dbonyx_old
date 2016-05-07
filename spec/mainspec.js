describe("Environment variables", function(){
	it("Battlenet API key should be set", function(){
		expect(process.env.API).not.toBeFalsy()
	})
	it("IP should be set", function(){
		expect(process.env.IP).not.toBeFalsy()
	})
	it("PORT should be set", function(){
		expect(process.env.PORT).not.toBeFalsy()
	})
	it("SESSION_SECRET should be set", function(){
		expect(process.env.SESSION_SECRET).not.toBeFalsy()
	})
	it("JWT_SECRET should be set", function(){
		expect(process.env.JWT_SECRET).not.toBeFalsy()
	})
	it("EMAIL_REFRESH_TOKEN should be set", function(){
		expect(process.env.EMAIL_REFRESH_TOKEN).not.toBeFalsy()
	})
	it("EMAIL_CLIENT_SECRET should be set", function(){
		expect(process.env.EMAIL_CLIENT_SECRET).not.toBeFalsy()
	})
	it("EMAIL_CLIENT_ID should be set", function(){
		expect(process.env.EMAIL_CLIENT_ID).not.toBeFalsy()
	})
	it("EMAIL_CLIENT_USER should be set", function(){
		expect(process.env.EMAIL_CLIENT_USER).not.toBeFalsy()
	})
})

