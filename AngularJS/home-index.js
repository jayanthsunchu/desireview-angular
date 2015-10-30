var module = angular.module('desireview', ['ngCookies', 'ngRoute']);
var rootUrl = "http://firstshowresponse.azurewebsites.net/";
//var rootUrl = "http://localhost:59545/";
module.controller('homeIndexController', ['$scope', '$http', '$cookies', '$location', 'dataService', 'ratingService', function ($scope, $http, $cookies, $location, dataService, ratingService) {
    $scope.isBusy = false;
    $scope.data = dataService;
	$scope.userInfo = {};
	$scope.newRating = {};
	var ratingFlag = false;
	$scope.addRating = function(rating, id){
		ratingFlag = true;
		if($cookies.get("UserName") != null)
			{
				$scope.newRating.UserName = $cookies.get("UserName");
				$scope.newRating.UserAccessToken = $cookies.get("AccessToken");
				$scope.newRating.Rating = rating;
				$scope.newRating.MovieId = id;
				ratingService.addUserRating($scope.newRating).then(function(){
					dataService.selectedmovies.filter(function(movie){return movie.Id == id;})[0].UserRating = rating;
				}, function(){});
			}
		else{
			alert("You need to be logged in to rate.");
		}
	};
	if($cookies.get("UserName") != null)
		$scope.userInfo.UserName = $cookies.get("UserName");
    if (dataService.isReady() == false) {
        $scope.isBusy = true;
        dataService.getMovies("", $scope.userInfo).then(function () {
            var defaultOption = $cookies.get("defaultlanguage");
            if (defaultOption != null) {
                $scope.selectedItem = defaultOption;
                dataService.selectedmovies = dataService.movies.filter(function (movie) {
                    if (defaultOption === "All")
                        return true;
                    else
                        return movie.MovieLanguage === defaultOption;
                });
            }
        }).then(function () {

        }).then(function () {
            $scope.isBusy = false;
        })
    }

    $scope.showReviewPage = function (data) {
        //alert(data);
    };

    $scope.listOfOptions = ['All', 'Telugu', 'Hindi', 'Tamil'];

    $scope.selectedItemChanged = function () {
        dataService.selectedmovies = dataService.movies.filter(function (movie) {
            if ($scope.selectedItem === "All")
                return true;
            else
                return movie.MovieLanguage === $scope.selectedItem;
        });
    }

    $scope.makeDefaultOption = function () {
        if ($scope.selectedItem != null) {
            $cookies.put("defaultlanguage", $scope.selectedItem);
        }
    };

    $scope.go = function (path, i) {
		if(!ratingFlag){
        dataService.selectedmovie = dataService.selectedmovies.filter(function (movie) {
            return movie.Title === i;
        });
        $location.path(path);
		}
		ratingFlag = false;
    };
}]);

if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i];
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
        return res;
    };
}

module.controller('loginController', ['$scope', 'loginService', '$cookies', '$location', '$window', function ($scope, loginService, $cookies, $location,$window) {
    $scope.existingUser = {};
    $scope.newUser = {};
    $scope.rememberme = 'NO';
    $scope.showerror = false;
    $scope.loginServiceResponse = loginService;
    $scope.ConfirmPassword = "";
    $scope.changepasswordflag = false;
    $scope.compareToPassword = function () {
        if ($scope.ConfirmPassword != $scope.newUser.Password)
            $scope.changepasswordflag = true;
        else
            $scope.changepasswordflag = false;
    };
    $scope.registerUser = function () {
        loginService.registerUser($scope.newUser).then(function () {
            $cookies.put("UserName", loginService.validatedUser.UserName);
            $cookies.put("AccessToken", loginService.validatedUser.AccessToken);
            $location.path("/#");
            ToggleLogin(false);
            ToggleLogout(true);
        },
        function () { });
    };
    $scope.checkUserName = function () {
        loginService.IsUserNameAvailable($scope.newUser.UserName).then(function () {
        }, function () { });
    };
    $scope.logIn = function () {
        loginService.validateUser($scope.existingUser).then(function () {
            $cookies.put("UserName", loginService.validatedUser.UserName);
            $cookies.put("AccessToken", loginService.validatedUser.AccessToken);
            $location.path("/#");
			$window.location.reload();
            ToggleLogin(false);
            ToggleLogout(true);
        }, function () {
            $scope.showerror = true;
            //show error message
        }).then(function () {

        });
    };
}]);

module.controller('contactController', ['$scope','contactService', function ($scope, contactService) {
	$scope.contact = {};
	$scope.showflag = false;
	$scope.submitContact = function() {
		contactService.submitContactInfo($scope.contact).then(function(){
			$scope.contact = {};
			$scope.showflag = true;
		}, function(){});
	};
}]);



module.controller('recordController', function(){
	
});

module.controller('resetController', ['$scope', 'loginService', '$routeParams', '$location', function ($scope, loginService, $routeParams, $location) {
    $scope.ConfirmPassword = "";
    $scope.changePasswordObject = {};
    $scope.showflag = false;
    $scope.changePasswordObject.Token = $routeParams.userToken;
    //console.log($routeParams.userToken);
    $scope.compare = function () {
        if ($scope.ConfirmPassword != $scope.changePasswordObject.Password)
            $scope.showflag = true;
        else
            $scope.showflag = false;
    };

    $scope.changePassword = function () {
        loginService.updatePassword($scope.changePasswordObject).then(function () {
            $location.path("/#/loginorregister");
        }, function () {
            alert("Your reset link expired.");
        }).then(function(){});
    };
}]);

module.controller('profileController', ['$scope', '$cookies', function ($scope, $cookies) {
    $scope.UserName = "No user logged in.";
    if ($cookies.get("UserName") != null)
        $scope.UserName = $cookies.get("UserName");
}]);

module.controller('forgotController', ['$scope', 'loginService', function ($scope, loginService) {
    $scope.emailObject = {};
    $scope.successflag = false;
    $scope.sendResetLink = function () {
        //console.log($scope.emailObject.Email);
        loginService.resetPasswordLink($scope.emailObject).then(function () {
            $scope.emailObject.Email = "";
            $scope.successflag = true;
        }, function () {
            $scope.successflag = false;
        });
    };

}]);


function RemoveCookies() {
    delete_cookie("UserName");
    delete_cookie("AccessToken");
    ToggleLogout(false);
    ToggleLogin(true);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

$(document).ready(function () {
    if (getCookie("UserName") == "") {
        ToggleLogin(true);
        ToggleLogout(false);
    }
    else {
        ToggleLogin(false);
        ToggleLogout(true);
    }
});

function ToggleLogin(flag) {
    if (flag) {
        $("#logInLink").show();
        $("#myProfileLink").hide();
    }
    else {
        $("#logInLink").hide();
        $("#myProfileLink").show();
    }
}

function ToggleLogout(flag) {
    if (flag) {
        $("#logOutLink").show();
    }
    else {
        $("#logOutLink").hide();
    }
}

function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

module.controller('reviewIndexController', ['$scope', 'dataService','ratingService', '$routeParams', '$cookies', function ($scope, dataService,ratingService, $routeParams, $cookies) {
    $scope.name = "Review Page";
	
	$scope.userInfo = {};
	if($cookies.get("UserName") != null)
		$scope.userInfo.UserName = $cookies.get("UserName");
	$scope.newRating = {};
	$scope.addRating = function(rating){
		if($cookies.get("UserName") != null)
			{
				$scope.newRating.UserName = $cookies.get("UserName");
				$scope.newRating.UserAccessToken = $cookies.get("AccessToken");
				$scope.newRating.Rating = rating;
				$scope.newRating.MovieId = dataService.selectedmovie.filter(function (movie) { return true; })[0].Id;
				ratingService.addUserRating($scope.newRating).then(function(){
					dataService.selectedmovie.filter(function(movie){return true;})[0].UserRating = rating;
				}, function(){});
			}
		else{
			alert("You need to be logged in to rate.");
		}
	};
    if (dataService.isReady()) {
        $scope.data = dataService;
        dataService.getReviewById(dataService.selectedmovie.filter(function (movie) { return true; })[0].Id)
    .then(function () {
			
    }).
    then(function () { });

    }
    else {
        $scope.data = dataService;
        if ($routeParams.movieTitle != null || $routeParams.movieTitle != "") {
            dataService.getMovies($routeParams.movieTitle, $scope.userInfo).then(function () {
                dataService.getReviewById(dataService.selectedmovie.filter(function (movie) { return true; })[0].Id)
                .then(function () {
					
                }).
                then(function () { });

            }).then(function () { });
        }

    }
}]);

module.factory('contactService', function($http, $q){
	var _submitContactInfo = function(contactInfo) {
		var deferred = $q.defer();
		$http.post(rootUrl + "api/contacts/submitcontact", contactInfo).then(function(result){
			deferred.resolve();
		}, function() {
			deferred.reject();
		});
		return deferred.promise;
	};
	return{
		submitContactInfo: _submitContactInfo
	};
});

module.factory("loginService", function ($http, $q) {
    var _validatedUser = {};
    var _userNameAvailable = { "flag": true };
    var _updatePassword = function (changedPassword) {
        var deferred = $q.defer();
        $http.post(rootUrl + "api/users/updatepassword", changedPassword).then(function (result) {
            //success
            deferred.resolve();
        }, function () {
            //failure
            deferred.reject();
        });
        return deferred.promise;

    };
    var _resetPasswordLink = function (email) {
        var deferred = $q.defer();
        $http.post(rootUrl + "api/users/sendpasswordresetlink",
            email).
            then(function (result) {
                deferred.resolve();
            },
            function () {
                deferred.reject();
            });
        return deferred.promise;
    };
    var _IsUserNameAvailable = function (username) {
        var deferred = $q.defer();
        $http.get(rootUrl + "api/users/isusernameavailable?id=" + username).then(
            function (result) {
                angular.copy(result.data, _userNameAvailable);
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
        return deferred.promise;
    };

    var _registerUser = function (newUser) {
        var deferred = $q.defer();
        $http.post(rootUrl + "api/users/registernewuser", newUser).then(function (result) {
            angular.copy(result.data, _validatedUser);
            deferred.resolve();
        }
        , function () {
            deferred.reject();
        });
        return deferred.promise;
    };
    var _validateUser = function (existingUser) {
        var deferred = $q.defer();
        $http.post(rootUrl + "api/users/validateexistinguser", existingUser)
        .then(function (result) {
            //alert(data.UserName);
            angular.copy(result.data, _validatedUser);
            deferred.resolve();
        }, function () {
            //alert(data);
            angular.copy({ StatusCode: 401 }, _validatedUser);
            deferred.reject();
        });
        return deferred.promise;
    };
    return {
        validateUser: _validateUser,
        validatedUser: _validatedUser,
        userNameAvailable: _userNameAvailable,
        IsUserNameAvailable: _IsUserNameAvailable,
        registerUser: _registerUser,
        resetPasswordLink: _resetPasswordLink,
        updatePassword: _updatePassword

    };
});

module.factory("ratingService", function($http, $q){
	var _userRating = {};
	
	var _addUserRating = function(addRating){
		var deferred = $q.defer();
		$http.post(rootUrl + "api/userratings/adduserrating", addRating).then(
			function(result){
				angular.copy(result.data, _userRating);
				deferred.resolve();
			}, 
			function(){
				deferred.reject();
			}
		);
		return deferred.promise;
	};
	return{
		userRating: _userRating,
		addUserRating: _addUserRating
	};
	
});

module.factory("dataService", function ($http, $q) {
    var _movies = [];
    var _selectedmovies = [];
    var _selectedmovie = [];
    var _reviewContent = [];

    var _IsInit = false;
    var _IsReady = function () {
        return _IsInit;
    };

    var _getReviewById = function (movieId) {
        var deferred = $q.defer();
        $http.get(rootUrl + "api/reviews/getreviewbyid?movieId=" + movieId).then(function (result) {
            angular.copy(result.data, _reviewContent);
            deferred.resolve();
        }, function () {
			var emptyRating = {ReviewTitle: "Haven't seen the movie yet.", ReviewContent: ""};
			angular.copy(emptyRating, _reviewContent);
            deferred.reject();
        });
        return deferred.promise;
    };
    var _getMovies = function (selectedReview, userInfo) {
        var deferred = $q.defer();
        $http.post(rootUrl + "api/movies/get", userInfo).then(function (result) {
            angular.copy(result.data, _movies);
            angular.copy(result.data, _selectedmovies);
            if (selectedReview != "")
                angular.copy(_selectedmovies.filter(function (movie) { return movie.Title === selectedReview; }), _selectedmovie);
            else
                angular.copy(_selectedmovies.filter(function (movie) { return movie.Title === _selectedmovies[0].Title; }), _selectedmovie);
            _IsInit = true;
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };
    return {
        movies: _movies,
        getMovies: _getMovies,
        selectedmovies: _selectedmovies,
        selectedmovie: _selectedmovie,
        isReady: _IsReady,
        getReviewById: _getReviewById,
        reviewContent: _reviewContent
    };

});
module.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);



module.config(function ($routeProvider) {
    $routeProvider.when("/", {
        controller: "homeIndexController",
        templateUrl: "/AngularTemplates/movieView.html",
    })
    .when("/moviereview/:movieTitle", {
        controller: "reviewIndexController",
        templateUrl: "/AngularTemplates/reviewView.html"
    })
    .when("/loginorregister", {
        controller: "loginController",
        templateUrl: "/AngularTemplates/loginView.html"
    })
    .when("/contact", {
        controller: "contactController",
        templateUrl: "/AngularTemplates/contactView.html"
    })
    .when("/profile", {
        controller: "profileController",
        templateUrl: "/AngularTemplates/profileView.html"
    })
        .when("/forgotpassword", {
            controller: "forgotController",
            templateUrl: "/AngularTemplates/forgotView.html"
        })
        .when("/resetpasswordlink/:userToken", {
            controller: "resetController",
            templateUrl: "/AngularTemplates/resetView.html"
        })
	.when("/recordview",{
		controller: "recordController",
		templateUrl: "/AngularTemplates/recordView.html"
	})
    .otherwise({ redirectTo: "/" });
});

