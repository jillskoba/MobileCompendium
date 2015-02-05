var app = angular.module('ionicApp', ['ionic'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		};
	if(window.StatusBar) {
		StatusBar.styleDefault();
		};
	});
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
        url: "/",
        templateUrl: "partials/home.html",
        controller: 'appController'
    })

  .state('details', {
        url: "/details/:itemId",
        templateUrl: "partials/details.html",
        controller: 'detailsController'
    })
  $urlRouterProvider.otherwise('/');
});


app.controller('appController', ['$scope', '$http', function ($scope, $http) {
	$http.get('compendium.json')
    .success(function(data) {
        $scope.contents = data;
    });
}]);

app.controller('detailsController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {
	$http.get('includes/getlist.php')
    .success(function(data) {
        //$scope.contents = data;
		//$scope.dragonId = $stateParams.itemId;
		$scope.content = data;
		$scope.whichDragon = $stateParams.itemId;
		
    });
}]);
