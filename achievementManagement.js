var request = require("request");
var db = require('./mongoose');

var total = 0;

get_achievements()

function get_achievements(){
	var url = "https://us.api.battle.net/wow/data/character/achievements?apikey="+process.env.API
	request({
		uri: url,
		json: true
	}, function(error, response, body){
		if(!error && response.statusCode===200){
			for(var i=0;i<body.achievements.length;i++){
				var categoryId = body.achievements[i].id
				db.achievement.create({
					_id:achievement.id,
					title:achievement.title,
					isCategory:true,
					categoryId:0
				})
				if(body.achievements[i].categories){
					for(var j=0;j<body.achievements[i].categories.length;j++){
						var category = body.achievements[i].categories[j]
						db.achievement.create({
							_id:categoryId,
							isCategory:true,
							categoryId:categoryId,
							title:category.title
						})
						var categoryId=category.id
						for(var k=0;k<category.achievements.length;k++){
							var achievement=category.achievements[k]
							insertAchievement(achievement,categoryId,false)
						}
					}
				}
				for(var j=0;j<body.achievements[i].achievements.length;j++){
					var isCategory=false
					var achievement = body.achievements[i].achievements[j]
					insertAchievement(achievement,categoryId,isCategory)
				}
			}
		}else{
			console.log(response.statusCode)
		}
	});
}

function insertAchievement(achievement, categoryId, isCategory){
	isCategory = isCategory||false
	db.achievement.create({
		_id:achievement.id,
		isCategory:isCategory,
		category:categoryId,
		title:achievement.title,
		points:achievement.points,
		description:achievement.description,
		reward:achievement.reward,
		rewardItems:achievement.rewardItems,
		icon:achievement.icon,
		criteria:achievement.criteria,
		accountWide:achievement.accountWide,
		factionId:achievement.facitonId
	})
}