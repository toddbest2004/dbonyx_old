angular.module('dbonyx')
.controller('importCtrl', ['$scope', 'fileUpload',function($scope, fileUpload){
	$scope.setFile = function(file){
		$scope.selectedFile = file
		// console.log(data)
	}
	$scope.importData = function(){
		if($scope.selectedFile){
			console.log('importing')
			fileUpload.uploadFileToUrl($scope.selectedFile[0]);
		}
	}
}])
.service('fileUpload', ['$http', 'Auth', function ($http, Auth) {
    this.uploadFileToUrl = function(file){
        var fd = new FormData();
        fd.append('importFile', file);
        $http.post('/api/data/import', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    }
}])
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);