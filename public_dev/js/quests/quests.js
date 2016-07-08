'use strict';
angular.module('dbonyx')
.controller('questCtrl', ['$scope', '$routeParams', 'questService', function($scope, $routeParams, questService){
	$scope.questId = $routeParams.questId;
	var getQuest = function(){
		$scope.loading = true;
		questService.getQuest($scope.questId, function(err, quest){
			$scope.loading = false;
			if(err){
				$scope.error=err;
				return;
			}
			$scope.quest = quest;
		});
	};
	getQuest();
}])
.controller('allQuestsCtrl', ['$scope','questService',function($scope, questService){
	$scope.modifiers = [];
	var getQuests = function(){
		$scope.loading = true;
		questService.getQuests($scope.modifiers, function(err, quests){
			$scope.loading = false;
			if(err){
				$scope.error = err;
				return;
			}
			$scope.quests = quests;
		});
	};
	getQuests();
}])
.factory('questService', ['$http', function($http){
	var quest = {};

	quest.getQuest = function(questId, cb){
		questId = parseInt(questId);
		$http({
			url: '/api/quest/'+questId
		}).then(function success(response){
			cb(null, response.data);
		}, function error(response){
			cb(response.data.error);
		});
	};

	quest.getQuests = function(modifiers, cb){
		$http({
			url: '/api/quest',
			params: {
				modifiers:modifiers
			}
		}).then(function success(response){
			cb(null, response.data.quests);
		},function error(response){
			cb(response.data.error);
		});
	};

	return quest;
}]);