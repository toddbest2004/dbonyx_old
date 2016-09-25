'use strict';

angular.module('dbonyx')
.controller('guildCtrl', ['onyxGuild', '$scope', '$routeParams', function(onyxGuild, $scope, $routeParams) {
	$scope.guildName = $routeParams.name;
	$scope.guildServer = $routeParams.server;
	$scope.characterClasses = ['','Warrior','Paladin','Hunter','Rogue','Priest','Death Knight','Shaman','Mage','Warlock','Monk','Druid', 'Demon Hunter'];

	onyxGuild.getGuild($scope.guildName, $scope.guildServer, "us", function(err, guild) {
		if(err||!guild) {
			$scope.error = err;
			return;
		}
		$scope.guild = guild;
	});
}]);