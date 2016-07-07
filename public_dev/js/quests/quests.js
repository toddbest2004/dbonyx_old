angular.module('dbonyx')
.controller('questCtrl', ['$scope', '$routeParams', 'questService', function($scope, $routeParams, questService){
	$scope.questId = $routeParams.questId;
	questService.getQuest($scope.questId, function(err, quest){
		if(err){
			$scope.error=err;
			return;
		}
		$scope.quest = quest;
	});
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

	return quest;
}]);