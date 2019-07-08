let app = angular.module('TelAvivYaHabibi', ["ngRoute", "userCtrl", "interestCtrl", "aboutCtrl", "profileCtrl", "detailCtrl","favoritesCtrl"]);

app.factory('interestDetails', function () {

    this.getDetails = function ($http, name, $window) {
        let details = [];
        $http.get("http://localhost:3000/publicInterest/interestDetails/" + name).then(function (data) {
            for (let i in data.data) {
                details.push(data.data[i]);
            }
            window.sessionStorage.setItem("currentInterest", JSON.stringify(details));
            $window.open("#!/details", "_blank");
        });
    };
    this.sendDetails = function () {

        return JSON.parse(window.sessionStorage.getItem("currentInterest"));

    };
    return this;
});
app.factory('userService', function () {
    let model = {};
    model.start = function () {
        window.sessionStorage.setItem("username", 'Guest');
        window.sessionStorage.setItem("token", 'no token');
        window.sessionStorage.setItem("favoriteInterests", '');
        window.sessionStorage.setItem("favoriteCount", '0');
    };
    model.setUsername = function (value) {
        window.sessionStorage.setItem("username", value);
        window.sessionStorage.setItem("login", "true");
    };

    model.getUsername = function () {
        return window.sessionStorage.getItem("username");

    };
    model.setFavorite = function (fave) {
        let arr = [];
        if (fave.length > 0) {
            arr = fave.split(",");
        }
        window.sessionStorage.setItem("favoriteCount", arr.length.toString());
        window.sessionStorage.setItem("favoriteInterests", JSON.stringify(arr));
    };
    model.getFavoriteCount = function () {
        return parseInt(window.sessionStorage.getItem("favoriteCount"));

    };
    model.setFavoriteCount = function (number) {
        let currentCount = parseInt(window.sessionStorage.getItem("favoriteCount"));
        currentCount += number;
        window.sessionStorage.setItem("favoriteCount", currentCount.toString());
    };
    model.addFavorite = function (fave) {
        this.setFavoriteCount(1);
        let favorites = [];
        if (window.sessionStorage.getItem("favoriteInterests").length > 0) {
            favorites = JSON.parse(window.sessionStorage.getItem("favoriteInterests"));
        }
        favorites.push(fave);
        window.sessionStorage.setItem("favoriteInterests", JSON.stringify(favorites));
    };
    model.removeFavorite = function (fave) {
        this.setFavoriteCount(-1);
        let favorites = JSON.parse(window.sessionStorage.getItem("favoriteInterests"));
        let index = favorites.indexOf(fave);
        favorites.splice(index, 1);
        window.sessionStorage.setItem("favoriteInterests", JSON.stringify(favorites));
    };
    model.getFavorite = function () {
        let favorites = [];
        if (window.sessionStorage.getItem("favoriteInterests").length > 0) {
            favorites = JSON.parse(window.sessionStorage.getItem("favoriteInterests"));
        }
        return favorites;
    };
    model.updateFavoriteDB = function ($http) {

    };
    model.setToken = function (value) {
        window.sessionStorage.setItem("token", value);
    };
    model.getToken = function () {
        return window.sessionStorage.getItem("token");
    };
    model.clearSession = function () {
        window.sessionStorage.clear();
        window.sessionStorage.setItem("login", "false");
    };
    model.loggedIn = function () {
        return (window.sessionStorage.getItem("login") === "true");
    };
    return model;
});


app.config(function ($routeProvider) {
    $routeProvider
        .when("/home",{
            templateUrl: "html/home.html",
            controller: "userCtrl"
        })
        .when("/login", {
            templateUrl: "html/login.html",
            controller: "userCtrl"
        })
        .when("/register", {
            templateUrl: "html/register.html",
            controller: "userCtrl"
        })
        .when("/about", {
            templateUrl: "html/about.html",
            controller: "aboutCtrl"
        })
        .when("/interest", {
            templateUrl: "html/interests.html",
            controller: "interestCtrl"
        })
        .when("/details", {
            templateUrl: "html/details.html",
            controller: "detailCtrl"
        })
        .when("/profile", {
            templateUrl: "html/profile.html",
            controller: "profileCtrl"
        })
        .when("/favorites", {
            templateUrl: "html/favoriteInterest.html",
            controller: "favoritesCtrl"
        })
        .otherwise({
            redirectTo: "/home",
        })


});