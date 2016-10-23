"use strict";
angular.module('dbonyx')
.factory('achievementService', ['$http', function($http) {
	var achievement = {};

	achievement.achievements = [];
	achievement.categories = [];

	achievement.getAchievements = function(cb) {

		$http({
			method: 'GET',
			url: '/api/achievements/achievements',
		}).then(function success(response){
			achievement.achievements = response.data;
			if(cb) {
				cb(null, achievement.achievements);
			}
		}, function error(response){
			if(cb) {
				cb(response.error);
			}
		});
	};

	achievement.getCategories = function(cb) {
		if (achievement.categories.length!==0) {
			return;
		}
		$http({
			method: 'GET',
			url: '/api/achievements/categories'
		}).then(function success(response){
			console.log(response.data)
			achievement.categories = response.data;
			if(cb) {
				cb(null, achievement.categories);
			}
		}, function error(response){
			if(cb) {
				cb(response.error);
			}
		});
	};

	return achievement;
}]);