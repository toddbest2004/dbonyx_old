var app = angular.module('dbonyx', ['AuctionCtrls', 'ItemCtrls', 'MenuCtrls', 'UserCtrls','ngRoute','ngCookies', 'ngAnimate'])

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
$httpProvider.interceptors.push('AuthInterceptor')
$routeProvider
.when('/', {
	templateUrl: 'app/views/index.html'
})
.when('/about', {
	templateUrl: 'app/views/about.html'
})
.when('/auctions', {
	templateUrl: 'app/views/auctions.html'
}) 
.when('/auctions/:realm', {
	templateUrl: 'app/views/auctions.html'
})
.when('/database', {
	templateUrl: 'app/views/database.html'
})
.when('/character', {
	templateUrl: 'app/views/character/lookup.html'
})
.when('/c/:name/:server/',{
	templateUrl: 'app/views/character/profile.html'
})
.when('/c/:name/:server/reputation',{
	templateUrl: 'app/views/character/reputation.html'
})
.when('/c/:name/:server/achievements',{
	controller: 'characterAchievementCtrl',
	templateUrl: 'app/views/character/achievements.html'
})
.when('/c/:name/:server/mounts',{
	templateUrl: 'app/views/character/mounts.html'
})
.when('/c/:name/:server/battlepets',{
	templateUrl: 'app/views/character/battlepets.html'
})
.when('/c/:name/:server/professions',{
	templateUrl: 'app/views/character/professions.html'
})
.when('/c/:name/:server/pvp',{
	templateUrl: 'app/views/character/pvp.html'
})
.when("/g/:name/:server", {
	controller: "guildCtrl",
	templateUrl: "app/views/guild/profile.html"
})
// .when('/character/:characterName', {
// 	templateUrl: 'app/views/character.html'
// })
.when('/community', {
	templateUrl: 'app/views/community.html' 
})
.when('/feedback', {
	templateUrl: 'app/views/feedback.html'
})
.when('/item/:id', {
	templateUrl: 'app/views/item.html'
})
.when('/mount/:id', {
	templateUrl: 'app/views/mount.html'
})
.when('/privacy', {
	templateUrl: 'app/views/privacy.html'
})
.when('/profile', {
	controller: 'privateProfileCtrl',
	templateUrl: 'app/views/privateprofile.html'
})
.when('/profile/:username', {
	controller: 'publicProfileCtrl',
	templateUrl: 'app/views/publicprofile.html'
})
.when('/quests', {
	controller: 'allQuestsCtrl',
	templateUrl: 'app/views/quests.html',
})
.when('/quests/:questId', {
	controller: 'questCtrl',
	templateUrl: 'app/views/quest.html'
})
.when('/register', {
	templateUrl: 'app/views/register.html'
})
.when('/terms', {
	templateUrl: 'app/views/terms.html'
})
.when('/validate/:user/:validateString', {
	templateUrl: 'app/views/validate.html'
})
.when('/forums', {
	controller: 'forumCtrl',
	templateUrl: 'app/views/forums/forumMain.html'
})
.when('/forums/cat/:categoryId', {
	controller: 'forumCatCtrl',
	templateUrl: 'app/views/forums/forumCategory.html'
})
.when('/forums/thread/:threadId', {
	controller: 'forumThreadCtrl',
	templateUrl: 'app/views/forums/forumThread.html'
})
.when('/forums/admin', {
	controller: 'forumAdminCtrl',
	templateUrl: 'app/views/forums/forumAdmin.html'
})
.when('/battlepets', {
	controller: 'allpetsCtrl',
	templateUrl: 'app/views/battlepets/allpets.html'
})
.when('/battlepet', {
	controller: 'allpetsCtrl',
	templateUrl: 'app/views/battlepets/allpets.html'
})
.when('/battlepet/:id', {
	controller: 'battlepetCtrl',
	templateUrl: 'app/views/battlepets/battlepet.html'
})
.when("/parsertest", {
	controller: 'parserCtrl',
	templateUrl: 'app/views/parsertest.html'
})
// .when('/import', {
// 	controller: 'importCtrl',
// 	templateUrl: 'app/views/import.html'
// })
.otherwise({
	templateUrl: 'app/views/404.html'
})

$locationProvider.html5Mode(true)
}])

.factory('onyxPersistence', ['$cookies',function($cookies){
	var persistence = {}
	var _persisted = {}
	var _realm
	var _characterName
	var _characterRealm
	persistence.setRealm=function(realm){
		_realm=realm
		$cookies.put('realm', realm)
	}
	persistence.getRealm=function(){
		return _realm||$cookies.get('realm')||''
	}

	persistence.set=function(key, value){
		_persisted[key]=value
		$cookies.put(key,value)
	}
	persistence.get=function(key){
		return _persisted[key]||$cookies.get(key)||''
	}
	return persistence
}])
.controller('mountCtrl', ['$scope','$routeParams', '$http',function($scope, $routeParams, $http){
	$scope.mountId = parseInt($routeParams.id)
	$scope.mount = {}
	$scope.loading=true

	if($scope.mountId){
		$http({
			method: 'GET',
			url: '/api/mount/'+$scope.mountId
		}).then(function success(response){
			// console.log(response)
			$scope.mount=response.data.mount
		},function error(response){
			//TODO: handle error
			// console.log(response)
		})
	}

	// $routeParams.id
}])
.controller('feedbackCtrl', ['$http','$scope', function($http, $scope){
	$scope.showForm=true
	$scope.sendFeedback = function(){
		$scope.error=''
		if($scope.message&&$scope.title){
			$http({
				url:'/api/user/feedback',
				method:'POST',
				data:{title:$scope.title,message:$scope.message}
			}).then(function success(response){
				$scope.success="Your message has been sent successfully!"
				$scope.showForm = false
			}, function error(response){
				$scope.error="There was an error sending your message, please try again."
			})
		}else{
			$scope.error="Please provide a title and a message."
		}
	}
}])

.controller('watchlistCtrl', ['$scope','$http',function($scope, $http){
	var getWatchlists = function(){
		$http({
			method: 'GET',
			url: '/api/watchlist/'
		}).then(function success(response){
			$scope.watchlists=response.data.watchlists
		},function error(response){
			//todo: error handling
		})
	}
	getWatchlists()
	$scope.watchlists=[]
	
}])