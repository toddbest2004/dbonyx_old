var request = require("request");
var db = require('./mongoose');
var async = require("async");

var realms = {};
var masterSlugs = {};
var region = 'us'

getRealms()

function getRealms(){
	//console.log("loading")
	var url = "https://"+region+".api.battle.net/wow/realm/status?locale=en_US&apikey="+process.env.API
	console.log(url)
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		console.log("Data returned")
		if(!error && response.statusCode===200){
			process_realm_data(body, 'us')
		}else{
			console.log("error: "+response.statusCode)
		}
	})
}

function process_realm_data(data, region){
	//TODO: load existing realm data to ensure master-slug doesn't get changed by new (or removed) realms
	console.log("Starting Process")
	data.realms.forEach(function(realm){
		db.realm.create({slug:realm.slug, region:region}).then(function(instance){
			
			if(!masterSlugs[realm.slug]){ //if this is the first time seeing this realm, it becomes the master slug for itself and all connected realms
				masterSlugs[realm.slug]=instance._id
				// console.log(instance._id)
				instance.masterSlug = instance._id
				instance.auctiontouch = 0
				instance.isMasterSlug = true
					
				realm.connected_realms.forEach(function(connected){
					masterSlugs[connected]=instance._id;
				})
			}
			instance.name=realm.name
			instance.masterSlug=masterSlugs[realm.slug]
			instance.type=realm.type
			instance.population=realm.population
			instance.battlegroup=realm.battlegroup
			instance.locale=realm.locale
			instance.timezone=realm.timezone
			instance.queue=realm.queue
			instance.save().then(function(){});
		});
		//add realms to realm model
		// addRealm(realm, region)
	})
	// fs.open(__dirname+"/../../static/realms.json", "w", function(err, fd){
	// 	if(!err){
	// 		fs.write(fd, JSON.stringify(realms), 0, 0, function(err){
	// 			if(err){
	// 				console.log(err);
	// 			}else{
	// 				console.log("File saved!");
	// 			}
	// 		})
	// 	}else{
	// 		console.log(err);
	// 	}
	// });	
}

function addRealm(realm, region){
	db.realm.findOrCreate({where:{slug:realm.slug, region:region}}).spread(function(instance, isnew){
		instance.name=realm.name,
		instance.masterSlug=masterSlugs[realm.slug],
		instance.type=realm.type,
		instance.population=realm.population,
		instance.battlegroup=realm.battlegroup,
		instance.locale=realm.locale,
		instance.timezone=realm.timezone,
		instance.queue=realm.queue
		instance.save();
	});
	realms[realm.name] = realm.slug;
}