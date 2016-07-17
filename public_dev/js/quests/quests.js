'use strict';
angular.module('dbonyx')
.controller('questCtrl', ['$scope', '$routeParams', 'questService', function($scope, $routeParams, questService){
	$scope.questId = $routeParams.questId;
	$scope.loading=questService.loading;
	$scope.error=questService.error;
	$scope.quest=questService.quest;
	var getQuest = function(){
		questService.getQuest($scope.questId, function(){
			$scope.quest=questService.quest;
			$scope.error=questService.error;
		});
	};
	getQuest();
}])
.controller('allQuestsCtrl', ['$scope','allQuestService',function($scope, allQuestService){
	$scope.modifiers = [];
	$scope.loading=allQuestService.loading;
	$scope.error=allQuestService.error;
	$scope.quests=allQuestService.allQuests;
	var getQuests = function(){
		allQuestService.getQuests($scope.modifiers, function(){
			$scope.quests=allQuestService.allQuests;
			$scope.error=allQuestService.error;
		});
	};
	getQuests();
}])
.factory('questService', ['$http', function($http){
	var quest = {};
	quest.loading=false;
	quest.error=null;
	quest.quest=null;

	quest.getQuest = function(questId,cb){
		quest.loading=true;
		quest.error=null;
		quest.quest=null;
		questId = parseInt(questId);
		$http({
			url: '/api/quest/'+questId
		}).then(function success(response){
			quest.loading=false;
			quest.quest=response.data;
			cb();
		}, function error(response){
			quest.loading=false;
			quest.error=response.data.error;
			cb();
		});
	};

	return quest;
}])
.factory('allQuestService', ['$http',function($http){
	var quest = {};
	quest.loading=false;
	quest.error=null;
	quest.allQuests=null;

	//modifiers
	quest.limit=50;
	quest.offset=0;

	quest.getQuests = function(modifiers,cb){
		quest.loading=true;
		quest.error=null;
		quest.allQuests=null;
		$http({
			url: '/api/quest',
			params: {
				modifiers:modifiers
			}
		}).then(function success(response){
			quest.loading=false;
			quest.allQuests=response.data.quests;
			cb();
		},function error(response){
			quest.error=response.data.error;
			quest.loading=false;
			cb();
		});
	};
	return quest;
}]);