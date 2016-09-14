'use strict';

angular.module('dbonyx')
.controller('guildCtrl', ['onyxGuild', '$scope', '$routeParams', function(onyxGuild, $scope, $routeParams) {
	$scope.guildName = $routeParams.name;
	$scope.guildServer = $routeParams.server;

	onyxGuild.getGuild($scope.guildName, $scope.guildServer, "us", function(err, guild) {
		if(err||!guild) {
			$scope.error = err;
			return;
		}
		$scope.guild = guild;
	});
}]);