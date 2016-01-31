var request = require("request");
var db = require('./mongoose');

var seen = []

get_mounts()

function get_mounts(){
	var url = "https://us.api.battle.net/wow/mount/?locale=en_US&apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			console.log(body.mounts.length)
			for(var i=0;i<body.mounts.length;i++){
				var mount = body.mounts[i]
				mount._id=mount.spellId
				db.mount.create(mount)
				if(seen.indexOf(mount.spellId)!==-1){
					console.log(mount)
				}else{
					seen.push(mount.spellId)
				}
			}
		}else{
			console.log(response.statusCode)
		}
	});
}