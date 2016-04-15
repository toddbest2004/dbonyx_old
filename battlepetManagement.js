var request = require("request");
var db = require('./mongoose');

getBattlepets()

function getBattlepets(){
	var url = "https://us.api.battle.net/wow/pet/?locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			console.log(body.pets.length)
			for(var i=0;i<body.pets.length;i++){
				var pet = body.pets[i];
				db.battlepet.create(pet, function(err, newpet){
					console.log(newpet)
					console.log(err)
				})
				// console.log(pet)
				return
			}
		}else{
			console.log(response.statusCode)
		}
	});
}

function getBattlepetDetails(){

}

function getAbilityDetails(){

}