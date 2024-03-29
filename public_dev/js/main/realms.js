"use strict";

angular.module('dbonyx')
.factory('realmService', ['$http', function($http){
	var realms = {};

	realms.realms = [];

	realms.getRealms=function(cb){
		if(realms.realms.length) {
			if(cb){
				return cb();
			}
			return;
		}
		realms.realms = ['Loading Realms'];
		$http({
			method: 'GET',
			url: '/api/realms'
		}).then(function success(response){
			var realmData = [];
			for(var region in response.data) {
				for(var realm in response.data[region]) {
					realmData.push(realm+"-"+region);
				}
			}
			realms.realms = realmData;
			if(cb) {
				cb();
			}
		}, function error(response){
			realms.realms = ['Unable to Load Realms'];
			if(cb) {
				cb();
			}
		});
	};

	return realms;
}]);