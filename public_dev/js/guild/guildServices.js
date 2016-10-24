"use strict";
angular.module('dbonyx')
.factory('onyxGuild', ['$http', function($http) {
	var guild = {};

	guild.getGuild = function(name, realm, region, callback) {
		var params = {
			name: name,
			realm: realm,
			region: region
		};
		$http({
			method: 'GET',
			url: '/api/guild/',
			params: params
		}).then(function success(response){
			console.log(response.data);
			callback(false, response.data);
		},function error(response){
			callback(response.error);
		});
	};

	return guild;
}]);