var app = angular.module('ionicApp', ['ionic', 'ui.router'])
    .run(function ($ionicPlatform, $rootScope) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            };
            if (window.StatusBar) {
                StatusBar.styleDefault();
            };
        });
    });

app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider

            //Home Tab
            .state('home', {
                url: "/",
                templateUrl: "partials/home.html",
                controller: 'appController',
                cache: false
            })

            //Register
            .state('register', {
                url: "/register",
                templateUrl: "partials/register.html",
                controller: 'registerController'
            })

            //Dragons (Colour) Tab
            .state('dragonsColour', {
                url: "/dragonsColour",
                templateUrl: "partials/dragonsColour.html",
                controller: 'dragonsController',
                cache: false
            })

            //Dragons (Family) Tab
            .state('dragonsFamily', {
                url: "/dragonsFamily",
                templateUrl: "partials/dragonsFamily.html",
                controller: 'dragonsController',
                cache: false
            })
			
            //Dragon Details 
            .state('details', {
                url: "/details/:itemId",
                templateUrl: "partials/details.html",
                controller: 'detailsController'
            })

            //Characters Tab
            .state('characters', {
                url: "/characters",
                templateUrl: "partials/characters.html",
                controller: 'charactersController',
                cache: false
            })

            //Settings Tab
            .state('settings', {
                url: "/settings",
                templateUrl: "partials/settings.html",
                controller: 'settingsController'
            })

            //Settings - FAQ
            .state('settingsFAQ', {
                url: "/settingsFAQ",
                templateUrl: "partials/settingsFAQ.html",
                controller: 'faqController'
            })

            //Settings - FAQ Answer
            .state('settingsFAQAnswer', {
                url: "/settingsFAQAnswer/:itemId",
                templateUrl: "partials/settingsFAQAnswer.html",
                controller: 'answersController'
            })

            //Settings - Credits
            .state('settingsCredits', {
                url: "/settingsCredits",
                templateUrl: "partials/settingsCredit.html",
                controller: 'appController'
            })

    $urlRouterProvider.otherwise('/');
});

app.value('global', {
	justLaunched: true, // check to see if page has been loaded for the first time (for first-time update of progress)
	regEmail: '',
	regPass: '',
	regCharName: '',
	regServer: '',
    errorReminder: true //do not pop up connection error if set to false
});

//Home
app.controller('appController', ['$scope', '$http', '$state', 'global', function ($scope, $http, $state, global) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }
	
	if (global.justLaunched) { // if the window's been loaded for the first time, push progress to server (account update in case of offline activity)
		var request = $http({
            method: "post",
            url: "http://www.jillskoba.com/compendium/populate.php", //--------------------------------------------------------------------------Replace with live
            data: {
                progress: JSON.parse(window.localStorage['progress'] || '{}')
            }
        });
        request.success(function (data) {
            console.log("success");
        })
        .error(function() {
            if (global.errorReminder) {
                $scope.connPopup();
            }
        });
		global.justLaunched = false;
	}
	
	// Connection error dialogue (special for 'do not remind'
    $scope.connPopup = function() {
        var myPopup = $ionicPopup.show({
            template: 'Could not connect to server. Updated information will still be saved, and will be sent when the application is next restarted with an internet connection',
            title: 'Error',
            scope: $scope,
            buttons: [
                { text: 'OK' },
                {
                text: 'Do Not Remind Me',
                onTap: function(e) {
                    global.errorReminder = false;
                }}
            ]
        });
    };
        
    $scope.dragons = JSON.parse(window.localStorage['dragons'] || '{}');
    $scope.progress = JSON.parse(window.localStorage['progress'] || '{}');
    $scope.character = JSON.parse(window.localStorage['characters'] || '{}');
	
	// only show scope info from array for our selected character
    var characterID = window.localStorage['selectedCharacter'];
    for (var i in $scope.character) {
        var characterList = $scope.character[i];
        if (characterList.character_id == characterID) {
            $scope.foundCharacter = characterList;
            break;
        }
    }

	// determine the count total for dragons collected (flagged as bool:true)
	var progressTotal = 0;
    for(var i = 0; i < $scope.progress.length; i++){
        if($scope.progress[i].character_id == window.localStorage['selectedCharacter']){
            if($scope.progress[i].bool == true) {
                progressTotal++;
            }
        }
    }
	
    if (progressTotal > 0) {
        $scope.characterCollected = progressTotal;
    } else {
        $scope.characterCollected = 0;
    }
    $scope.dragonsTotal = $scope.dragons.length;
    
}]);

//Register
app.controller('registerController', ['$scope', '$http', '$ionicPopup', '$ionicModal', '$state', 'global', function ($scope, $http, $ionicPopup, $ionicModal, $state, global) {
    if (!window.localStorage['dragons'] == '') {
        $state.go('home');
    } 
	
	//Initialize all storage functions for first-time registration
        $scope.localStore = function () {
            //get dragon list database
            $http.get('dragons.json')
                .success(function (data) {
                    window.localStorage['dragons'] = JSON.stringify(data);
                    console.log("Dragon List complete");
                    console.log(data);
                });

            //get faqs
            $http.get('faqs.json')
                .success(function (data) {
                    window.localStorage['faqs'] = JSON.stringify(data);
                    console.log("FAQ Q/A set: complete");
                });

            //get user's characters
            $http.get('characters.json')
                .success(function (data) {
                    window.localStorage['characters'] = JSON.stringify(data);
                    console.log("User's characters set complete");
                });

            //get user's progress
            $http.get('progress.json')
                .success(function (data) {
                    window.localStorage['progress'] = JSON.stringify(data);
                    console.log("User's Progress set complete");
                });
        }
    
    //Error Popup
    $scope.errorMessage = '';
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: $scope.errorMessage
        });
        alertPopup.then(function(res) {});
    };

    //Create User Function
    $scope.reg = {};
    $scope.submit = function () {
        $scope.errorMessage = '';

        if (!$scope.reg.email) {
            $scope.errorMessage = 'Email Required';
            $scope.showAlert();
            return;
        }

        if (!$scope.reg.pass1) {
            $scope.errorMessage = 'Password Required';
            $scope.showAlert();
            return;
        }

        if (!$scope.reg.pass2) {
            $scope.errorMessage = 'Please Reenter Password';
            $scope.showAlert();
            return;
        }

        if ($scope.reg.pass1 != $scope.reg.pass2) {
            $scope.errorMessage = 'Passwords dont match!';
            $scope.showAlert();
            return;
        }
       
        var request = $http({
            method: "post",
            url: "http://www.jillskoba.com/compendium/register.php", //--------------------------------------------------------------------------Replace with live
            data: {
                email: $scope.reg.email,
                password: $scope.reg.pass1
            }
        });
        request.success(function (data) {
            if (data == "1") { //email doesn't exist, continue as normal
                global.regEmail = $scope.reg.email;
                global.regPass = $scope.reg.pass1;
                $scope.openCharacterModal();
            }
            if (data == "2") { //failure for misc reason
                $scope.errorMessage = "Create Account failed";
                $scope.showAlert();
				return;
            }
            else if (data == "0") { //email already exists
                $scope.errorMessage = "Email Already Exist";
                $scope.showAlert();
				return;
            }
        })
        .error(function() {
            if (global.errorReminder) {
                $scope.connPopup();
            }
        });
    };
    
	
    // Connection error dialogue
    $scope.connPopup = function() {
        var myPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Could not connect to server. Please check your internet connection'
        });
    };
	

    //Create Character Modal
    $ionicModal.fromTemplateUrl('createChar.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.charModal = modal;
    });
    $scope.openCharacterModal = function () {
            $scope.charModal.show();
    };
    $scope.closeCharacterModal = function () {
        $scope.charModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.charModal.remove();
    });
    $scope.$on('charModal.hidden', function () {});
    $scope.$on('charModal.removed', function () {});
	
		
     //Create Character Function
    $scope.character = {};
    $scope.submitChar = function () {
    $scope.errorMessage = '';
        if (!$scope.character.name) {
            $scope.errorMessage = 'Character Name Required';
            $scope.showAlert();
            return;
        }		
        if (!$scope.character.server) {
            $scope.errorMessage = 'Server Required';
            $scope.showAlert();
            return;
        }
			
        var request = $http({
            method: "post",
            url: "http://www.jillskoba.com/compendium/register.php", //--------------------------------------------------------------------------Replace with live
            data: {
                email: global.regEmail,
                password: global.regPass,
                character: $scope.character.name,
                server: $scope.character.server
            }
        });
        request.success(function (data) {
            if (data == "0") {
                $scope.errorMessage = "Email Already Exist";
                $scope.showAlert();
				return;
            }
			if (data == "1") {
                $scope.errorMessage = "Character name already exists";
                $scope.showAlert();
				return;
            }
            if (data == "2") {
                $scope.errorMessage = "Create Account failed";
                $scope.showAlert();
				return;
            }
            else { //Assume all was successful... populate local storage with data
				console.log("success!");
				var character;
				var defaultCharacterSelect;
                window.localStorage['characters'] = JSON.stringify(data.characterQuery);
                window.localStorage['progress'] = JSON.stringify(data.progressQuery);
                window.localStorage['faqs'] = JSON.stringify(data.faqsQuery);
                window.localStorage['dragons'] = JSON.stringify(data.dragonsQuery);
				window.localStorage['registeredEmail'] = global.regEmail;
                character = JSON.parse(window.localStorage['characters'] || '{}');
                defaultCharacterSelect = character[0].character_id;
                window.localStorage['selectedCharacter'] = defaultCharacterSelect;
                $scope.closeCharacterModal();
                $state.go('home');
            }
        })
        .error(function() {
            if (global.errorReminder) {
                $scope.connPopup();
            }
        });
    };

    //Log In Popup
    $scope.loginPopup = function () {
        $scope.data = {};
        var loginPopup = $ionicPopup.show({
            template: '<input type="email" ng-model="data.email" placeholder="Email"><br><input type="password" ng-model="data.pass" placeholder="Password">',
            title: 'Log In',
            scope: $scope,
            buttons: [
                {text: 'Cancel'},
                {
                text: '<b>Submit</b>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.data.email || !$scope.data.pass) {
                        e.preventDefault();
                    } else {
                        var request = $http({
                        method: "post",
                        url: "http://www.jillskoba.com/compendium/login.php", //--------------------------------------------------------------------------Replace with live
                        data: {
                            email: $scope.data.email,
                            password: $scope.data.pass
                        }
                    });
                    request.success(function (data) {
                        if (data == "2") { //failure for misc reason
                            $scope.errorMessage = "Failed to update";
                            $scope.showAlert();
							return;
                        }
                        if (data == "1") { //credentials invalid
                            $scope.errorMessage = "Error: Invalid Credentials";
                            $scope.showAlert();
							return;
                        }
                        else { //Assume all was successful... populate local storage with data
							var character;
							var defaultCharacterSelect;
                            window.localStorage['characters'] = JSON.stringify(data.characterQuery);
                            window.localStorage['progress'] = JSON.stringify(data.progressQuery);
                            window.localStorage['faqs'] = JSON.stringify(data.faqsQuery);
                            window.localStorage['dragons'] = JSON.stringify(data.dragonsQuery);
							window.localStorage['registeredEmail'] = $scope.data.email;
                            character = JSON.parse(window.localStorage['characters'] || '{}');
                            defaultCharacterSelect = character[0].character_id;
                            window.localStorage['selectedCharacter'] = defaultCharacterSelect;
                            $state.go('home');
                        }
                    })
                    .error(function() {
                        if (global.errorReminder) {
                            $scope.connPopup();
                        }
                    });
                    }
                }}
            ]
        });
    };
}]);


//Dragon List
app.controller('dragonsController', ['$scope', '$http', '$ionicPopup', '$ionicActionSheet', '$ionicModal', '$state', 'global', function ($scope, $http, $ionicPopup, $ionicActionSheet, $ionicModal, $state, global) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }
	
	$scope.contents = JSON.parse(window.localStorage['dragons'] || '{}');
    $scope.progressList = JSON.parse(window.localStorage['progress'] || '{}');
    $scope.characterID = window.localStorage['selectedCharacter'];
    
	// Show / Hide headers based on existence of content in input
    $scope.searchFilter = {dragon_name : ""};
    $scope.$watch("searchFilter.dragon_name", function() {
        if ($scope.searchFilter.dragon_name.length > 0) {
            $scope.showHide = {
                'display': 'none',
                'margin' : 0
            };
        } else {
            $scope.showHide = {
                'display': 'block'
            };
        }
      }, true);

	// Push changes to database whenever a checkbox is tapped
    $scope.saveProgress = function(dragonID) {
        window.localStorage['progress'] = JSON.stringify($scope.progressList);
        var foundDragon = null;
        for (var i in $scope.progressList) {
            var dragonList = $scope.progressList[i];
            if (dragonList.dragon_id == dragonID) {
                foundDragon = dragonList;
                break;
            }
        };

        if (foundDragon != null) {
            $scope.foundDragon = foundDragon;
            var request = $http({
                method: "post",
                url: "http://www.jillskoba.com/compendium/update.php", //--------------------------------------------------------------------------Replace with live
                data: {
                    characterID: $scope.foundDragon.character_id,
                    dragonID: $scope.foundDragon.dragon_id,
                    bool: $scope.foundDragon.bool
                },
            });
            request.success(function (data) {
                if (data == "2") { //failure for misc reason
                   $scope.errorMessage = "Failed to update";
				   $scope.showAlert();
				   return;
                }
            })
            .error(function() {
                if (global.errorReminder) {
                    $scope.connPopup();
                }
            });
        }
    };
    
    // Connection error dialogue (special for 'do not remind'
    $scope.connPopup = function() {
        var myPopup = $ionicPopup.show({
            template: 'Could not connect to server. Updated information will still be saved, and will be sent when the application is next restarted with an internet connection',
            title: 'Error',
            scope: $scope,
            buttons: [
                { text: 'OK' },
                {
                text: 'Do Not Remind Me',
                onTap: function(e) {
                    global.errorReminder = false;
                }}
            ]
        });
    };
	
	
	//Error Popup
    $scope.errorMessage = '';
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: $scope.errorMessage
        });
        alertPopup.then(function(res) {});
    };
	
    
	// User Lookup
    $scope.sharePrompt = function () {
        $scope.data = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="email" ng-model="data.searchUser">',
            title: 'Enter User Email',
            scope: $scope,
            buttons: [
                {text: 'Cancel'},
                {text: '<b>Search</b>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.data.searchUser) {
                        //No valid email received; error out
                        $scope.showAlert();
                        e.preventDefault();
                    } else {
                        //query database for user if connected to the internet
                        var request = $http({
                            method: "post",
                            url: "http://www.jillskoba.com/compendium/search.php", //--------------------------------------------------------------------------Replace with live
                            data: {
                                email: $scope.data.searchUser
                            }
                        });
                        request.success(function (data) {
                            if (data == "1") { //email doesn't exist, search fails
                                $scope.errorMessage = "No Users Found";
								$scope.showAlert();
								return;
                            }
                            if (data == "2") { //failure for misc reason
                                $scope.errorMessage = "Search failed for unknown reason";
								$scope.showAlert();
								return;
                            }
                            else { //email found, grabbing data
                                $scope.characterData = data;
                                $scope.openCharSelectModal();
                            }
                        })
                        .error(function() {
                            if (global.errorReminder) {
                                $scope.connPopup();
                            }
                        });
                    }
                }}
            ]
        });
    };
        
    // After user is selected, call server for character list
    $scope.callCharacterProgress = function(id) {
        var request = $http({
            method: "post",
            url: "http://www.jillskoba.com/compendium/getFriendProgress.php", //--------------------------------------------------------------------------Replace with live
            data: {
                characterID: id
            }
        });
        request.success(function (data) {
            if (data == "2") { //failure for misc reason
                $scope.errorMessage = "Loading dragons failed for unknown reason";
				$scope.showAlert();
				return;
            }
            else { //email found, grabbing data
                $scope.dragonData = data;
                $scope.closeCharSelectModal();
                $scope.openCharProgressModal();
            }
        })
        .error(function() {
            if (global.errorReminder) {
                $scope.connPopup();
            }
        });
    };
        
        
    // Character Select Prompt Modal (Character List from User Search)
    $ionicModal.fromTemplateUrl('charSelect-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.charSelectModal = modal;
    });
    $scope.openCharSelectModal = function () {
        $scope.charSelectModal.show();
    };
    $scope.closeCharSelectModal = function () {
        $scope.charSelectModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.charSelectModal.remove();
    });
    $scope.$on('charSelectModal.hidden', function () {});
    $scope.$on('charSelectModal.removed', function () {});
            
            
    // Character's Dragon Progress Modal (Dragon List from Character Select / User Search)
    $ionicModal.fromTemplateUrl('charProgress-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.charProgressModal = modal;
    });
    $scope.openCharProgressModal = function () {
       $scope.charProgressModal.show();
    };
    $scope.closeCharProgressModal = function () {
        $scope.charProgressModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.charProgressModal.remove();
    });
    $scope.$on('charProgressModal.hidden', function () {});
    $scope.$on('charProgressModal.removed', function () {});
            
	
	// Connection Error
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Please enter a valid email address'
        });
    };

	
	// Sort by Colour/Family ActionSheet
    $scope.sortPrompt = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Colour'},
                {text: 'Family'}
            ],
            titleText: 'Select a category to sort by',
            cancelText: 'Cancel',
            cancel: function () {},
            buttonClicked: function (index) {
                if (index == 0) {
                    $state.go('dragonsColour', {}, {reload: true});
                } //Colour
                if (index == 1) {
                    $state.go('dragonsFamily', {}, {reload: true});
                } //Family
                return true;
            }
        });
    };
}]);


//Dragon Details
app.controller('detailsController', ['$scope', '$stateParams', '$ionicModal', '$state', function ($scope, $stateParams, $ionicModal, $state) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }
        
    $scope.content = JSON.parse(window.localStorage['dragons'] || '{}');
    var dragonIdToFind = $stateParams.itemId;

	// Grab ID of selection (to prevent app from basing content on true dragon ID, rather than indexed ID
    var foundDragon = null;
    for (var i in $scope.content) {
        var dragon = $scope.content[i];
        if (dragon.dragon_id == dragonIdToFind) {
            foundDragon = dragon;
            break;
        }
    }

    if (foundDragon === null){
        $state.go('dragonsFamily');
    }

    $scope.dragon = foundDragon;

	
    // Styling for buttons
    var isWild = false;
    var isMarketplace = false;
    var isSpecial = false;
    var isEgg = false;

    var wildCol = "#cc3333";
    var marketCol = "#cc3333";
    var specialCol = "#cc3333";
    var eggCol = "#cc3333";

	
    // Define styles for buttons
    for (var i in $scope.dragon.zones) {
        var locations = $scope.dragon.zones[i].zone_id;
        if (locations <= 13) { //check for wild dragon entries
            isWild = true;
            wildCol = "#33cc33";
        }

        if (locations == 14) { //check for marketplace entries
            isMarketplace = true;
            marketCol = "#33cc33";
        }

        if (locations == 15) { //check for Special entries
            isSpecial = true;
            specialCol = "#33cc33";
        }

        if (locations == 16) { //check for Dragon Egg entries
            isEgg = true;
            eggCol = "#33cc33";
        }
    }

	
    // Set Styles
    $scope.wildBut = {
        'background-color': wildCol,
        'color': 'white',
        'border': 'none'
    };

    $scope.marketBut = {
        'background-color': marketCol,
        'color': 'white',
        'border': 'none'
    };

    $scope.specialBut = {
        'background-color': specialCol,
        'color': 'white',
        'border': 'none'
    };

    $scope.eggBut = {
        'background-color': eggCol,
        'color': 'white',
        'border': 'none'
    };

	
	// Wild Popup
    $ionicModal.fromTemplateUrl('wild-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.wildModal = modal;
    });
    $scope.openWildModal = function () {
        if (isWild) {
            $scope.wildModal.show();
        }
    };
    $scope.closeWildModal = function () {
        $scope.wildModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.wildModal.remove()
    });
    $scope.$on('wildModal.hidden', function () {});
    $scope.$on('wildModal.removed', function () {});
	
	
	// Marketpalce Popup
    $ionicModal.fromTemplateUrl('market-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.marketModal = modal;
    });
    $scope.openMarketModal = function () {
        if (isMarketplace) {
            $scope.marketModal.show();
        }
    };
    $scope.closeMarketModal = function () {
        $scope.marketModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.marketModal.remove();
    });
    $scope.$on('marketModal.hidden', function () {});
    $scope.$on('marketModal.removed', function () {});

	
	// Special Popup
    $ionicModal.fromTemplateUrl('special-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.specialModal = modal;
    });
    $scope.openSpecialModal = function () {
        if (isSpecial) {
            $scope.specialModal.show();
        }
    };
    $scope.closeSpecialModal = function () {
        $scope.specialModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.specialModal.remove();
    });
    $scope.$on('specialModal.hidden', function () {});
    $scope.$on('specialModal.removed', function () {});
	
	
	// Egg Popup
    $ionicModal.fromTemplateUrl('egg-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.eggModal = modal;
    });
    $scope.openEggModal = function () {
        if (isEgg) {
            $scope.eggModal.show();
        }
    };
    $scope.closeEggModal = function () {
        $scope.eggModal.hide();
    };
    $scope.$on('$destroy', function () {
         $scope.eggModal.remove();
    });
    $scope.$on('eggModal.hidden', function () {});
    $scope.$on('eggModal.removed', function () {});
}]);


//Character
app.controller('charactersController', ['$scope', '$state', '$ionicModal', '$ionicPopup', '$http', 'global', function ($scope, $state, $ionicModal, $ionicPopup, $http, global) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }  
    $scope.contents = JSON.parse(window.localStorage['characters'] || '{}');
    $scope.data = {
        characterSelection: window.localStorage['selectedCharacter']
    };
	
	
	// Change character selection on tap
    $scope.selectCharacter = function (character) {
        window.localStorage['selectedCharacter'] = character;
    };
        
		
     // Add Character
    $ionicModal.fromTemplateUrl('add-char.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.addCharModal = modal;
    });
    $scope.openAddCharModal = function () {
        $scope.addCharModal.show();
    };
    $scope.closeAddCharModal = function () {
        $scope.addCharModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.addCharModal.remove();
    });
    $scope.$on('addCharModal.hidden', function () {});
    $scope.$on('addCharModal.removed', function () {});
            
        
    //Create Character Function
    $scope.character = {};
    $scope.addCharacter = function () {
    $scope.errorMessage = '';
    $scope.email = window.localStorage['registeredEmail'];
    
    if (!$scope.character.name) {
        $scope.errorMessage = 'Character Name Required';
        $scope.showAlert();
        return;
    }		
    if (!$scope.character.server) {
        $scope.errorMessage = 'Server Required';
        $scope.showAlert();
        return;
    }
	
	if (JSON.parse(window.localStorage['characters'] || '{}').length == 6) {
		$scope.errorMessage = 'You cannot have more than six characters';
        $scope.showAlert();
		return;
	}
			
    var request = $http({
        method: "post",
        url: "http://www.jillskoba.com/compendium/addCharacter.php", //--------------------------------------------------------------------------Replace with live
        data: {
            email: $scope.email,
            character: $scope.character.name,
            server: $scope.character.server
            }
        });
        request.success(function (data) {
			if (data == "1") { //character already exists
				$scope.errorMessage = "Error: Character already exists";
				$scope.showAlert();
				return;
			}
            if (data == "2") {
                $scope.errorMessage = "Create Account failed";
                $scope.showAlert();
				return;
            }
            else {
                window.localStorage['characters'] = JSON.stringify(data.characterQuery);
                window.localStorage['progress'] = JSON.stringify(data.progressQuery);
                var character = JSON.parse(window.localStorage['characters'] || '{}');
                var defaultCharacterSelect = character[0].character_id;
                window.localStorage['selectedCharacter'] = defaultCharacterSelect;
                $scope.closeAddCharModal();
                $state.reload();
            }
        })
        .error(function() {
            if (global.errorReminder) {
                $scope.connPopup();
            }
        });
    };
            
            
    // Delete Character
    $ionicModal.fromTemplateUrl('delete-char.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.deleteCharModal = modal;
    });
    $scope.openDeleteCharModal = function () {
        $scope.deleteCharModal.show();
    };
    $scope.closeDeleteCharModal = function () {
        $scope.deleteCharModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.deleteCharModal.remove();
    });
    $scope.$on('deleteCharModal.hidden', function () {});
    $scope.$on('deleteCharModal.removed', function () {});
    
	
    // Connection error dialogue
    $scope.connPopup = function() {
        var myPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Could not connect to server. Please check your internet connection'
        });
    };
	
	//Error Popup
    $scope.errorMessage = '';
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: $scope.errorMessage
        });
        alertPopup.then(function(res) {});
    };
    
	
    //Delete Character Function
    $scope.deleteCharacter = function (characterID) {
        
		// Prevent the user from deleting their last character
		if (JSON.parse(window.localStorage['characters'] || '{}').length == 1) {
			$scope.errorMessage = 'You cannot have fewer than one character';
			$scope.showAlert();
			return;
		}
				
		// Have user confirm if they really want to delete their character & progress
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to delete this character?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                var request = $http({
                method: "post",
                url: "http://www.jillskoba.com/compendium/deleteCharacter.php", //--------------------------------------------------------------------------Replace with live
                data: {
                    characterID: characterID
                    }
                });
                request.success(function (data) {
                    if (data == "2") {
                        $scope.errorMessage = "Character Deletion failed";
                        $scope.showAlert();
                    }
                    else {
                        window.localStorage['characters'] = JSON.stringify(data.characterQuery);
                        window.localStorage['progress'] = JSON.stringify(data.progressQuery);
                        var character = JSON.parse(window.localStorage['characters'] || '{}');
                        var defaultCharacterSelect = character[0].character_id;
                        window.localStorage['selectedCharacter'] = defaultCharacterSelect;
                        $scope.closeDeleteCharModal();
                        $state.reload();
                    }
                })
                .error(function() {
                    if (global.errorReminder) {
                        $scope.connPopup();
                    }
                });
            }
        });
    };   
}]);

//FAQ
app.controller('faqController', ['$scope', '$state', function ($scope, $state) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }  
    $scope.contents = JSON.parse(window.localStorage['faqs'] || '{}');
}]);


//FAQ Answers
app.controller('answersController', ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }  
    $scope.content = JSON.parse(window.localStorage['faqs'] || '{}');
    $scope.whichQuestion = $stateParams.itemId;
}]);


//Settings
app.controller('settingsController', ['$scope', '$ionicPopup', '$state', function ($scope, $ionicPopup, $state) {
    if (!window.localStorage['dragons']) {
        $state.go('register');
    }  
    $scope.clearConfirm = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to clear all data?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                window.localStorage['dragons'] = '';
                window.localStorage['faqs'] = '';
                window.localStorage['characters'] = '';
                window.localStorage['progress'] = '';
                $state.go('register');
            } else {}
        });
    };
}]);