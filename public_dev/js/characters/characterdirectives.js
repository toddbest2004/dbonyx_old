'use strict';
/*
*characterLinks directive expects a character to be in scope, and will
*provide a list of links to various pages for that character.
*All links are in the form:
* /c/{{character.name}}/{{character.realm}}-{{character.region}}/suffix
*/
angular.module('dbonyx')
.directive('characterLinks', [function() {
	var ctr = ['$scope', function($scope) {
		$scope.links = [
			{title: "Profile", suffix:""},
			{title: "Reputation", suffix:"reputation"},
			{title: "Achievements", suffix:"achievements"},
			{title: "Mounts", suffix:"mounts"},
			{title: "Battlepets", suffix:"battlepets"},
			{title: "Professions", suffix:"professions"},
			{title: "Pvp", suffix:"pvp"},
		];
	}];

	return {
		controller: ctr,
		restrict: 'E',
		replace: true,
		templateUrl: 'app/templates/characterLinks.html'
	};
}]);