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
	$scope.settings = allQuestService.settings;
	$scope.loading=allQuestService.loading;
	$scope.error=allQuestService.error;
	$scope.quests=allQuestService.allQuests;
	$scope.getQuests = function(){
		allQuestService.getQuests(function(){
			$scope.quests=allQuestService.allQuests;
			$scope.error=allQuestService.error;
			$scope.settings=allQuestService.settings;
			$scope.$broadcast("paginateUpdate");
		});
	};
	$scope.getQuests();
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
	quest.settings={limit:50,offset:0,count:0};

	quest.getQuests = function(cb){
		quest.loading=true;
		quest.error=null;
		quest.allQuests=null;
		$http({
			url: '/api/quest',
			params: {
				limit:quest.settings.limit,
				offset:quest.settings.offset
			}
		}).then(function success(response){
			quest.loading=false;
			quest.allQuests=response.data.quests;
			quest.settings.count=response.data.count;
			if(cb)
				cb();
		},function error(response){
			quest.error=response.data.error;
			quest.loading=false;
			if(cb)
				cb();
		});
	};
	return quest;
}]);