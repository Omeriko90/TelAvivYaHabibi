angular.module('favoritesCtrl', [])

    .controller("favoritesCtrl", function ($scope, $http, userService, $window, interestDetails, review, interest) {
        if (!userService.loggedIn()) {
            document.getElementById("popup").style.display = "block";
        }
        $scope.tokenVar = userService.getToken();
        $scope.username = userService.getUsername();
        $scope.interstSpecific = '';
        $scope.categories = {};
        $scope.userInterests = [];
        $scope.favoriteList = userService.getFavorite();
        $scope.sortedCategory = [];
        $scope.userSortedList = [];
        $scope.sortByRank = [];
        $scope.favoriteLength = $scope.favoriteList.length;
        //gets all interests points
        $http.get("http://localhost:3000/publicInterest/getInterests").then(function (data) {
            for (let i in data.data.data) {
                $scope.categories[data.data.data[i].name] = data.data.data[i];
            }
            $scope.initUserInterests();
        });
        //gets all the user interests
        $scope.initUserInterests = function () {
            let userInterest = userService.getFavorite();
            for (let i in userInterest) {
                let test = userInterest[i];
                $scope.userInterests.push($scope.categories[userInterest[i]]);
                $scope.sortByRank.push($scope.categories[userInterest[i]]);
                $scope.sortedCategory.push($scope.categories[userInterest[i]]);
            }
        };
        //sorts the user interests from top-rated down
        $scope.sortByMaxRank = function () {
            $scope.sortByRank = interest.sortMaxRank($scope.sortByRank);
            $scope.userInterests = [];
            for (let j in $scope.sortByRank) {
                $scope.userInterests.push($scope.sortByRank[j]);
            }
        };
        //sorts the user interests from less-rated up
        $scope.sortByMinRank = function () {
            $scope.sortByRank = interest.sortMinRank($scope.sortByRank);
            $scope.userInterests = [];
            for (let j in $scope.sortByRank) {
                $scope.userInterests.push($scope.sortByRank[j]);
            }
        };
        //sorts the user interests by category
        $scope.sortByCategory = function () {
            $scope.sortedCategory = interest.sortCategory($scope.sortedCategory);
            $scope.userInterests = [];
            for (let j in $scope.sortedCategory) {
                $scope.userInterests.push($scope.sortedCategory[j]);
            }
        };
        //sorts the user interests by the user choices
        $scope.sortByUserChoice = function () {
            var pointingHands = document.getElementsByClassName("fa-hand-o-right");
            document.getElementById("sorting").style.display = "block";
            for (let i = 0; i < pointingHands.length; i++) {
                pointingHands[i].style.display = "inline-block";
            }
        };
        //add an interest to the user sorted list
        $scope.addToSortUser = function (name) {
            let temp = $scope.userSortedList;
            temp.push($scope.categories[name]);
            $scope.userSortedList = [];
            for (let i = 0; i < temp.length; i++) {
                $scope.userSortedList.push(temp[i]);
            }
        };
        //remove an interest form the user sorted list
        $scope.removeFromSortUser = function (index) {
            $scope.userSortedList.splice(index, 1);
        };
        //saves and delete interests from the user
        $scope.save = function (event) {
            if (!event.target.classList.contains("fullStar")) {
                event.target.classList.add("fullStar");
                interest.save($http, userService, this.category.name);
                userService.addFavorite(this.category.name);
                $scope.favoriteLength = userService.getFavoriteCount();
            } else {
                event.target.classList.remove("fullStar");
                interest.remove($http, userService, this.category.name);
                userService.removeFavorite(this.category.name);
                $scope.favoriteLength = userService.getFavoriteCount();
                $scope.favoriteList = userService.getFavorite();
            }
        };
        //updates the DB on the user favorite list
        $scope.saveToUser = function () {
            let favorite = '';
            for (let i = 0; i < $scope.userSortedList.length; i++) {
                if (i < $scope.userSortedList.length - 1) {
                    favorite += $scope.userSortedList[i].name + ',';
                }
                else{
                    favorite += $scope.userSortedList[i].name;
                }
            }
            //updates the DB with the new sorted list
            userService.setFavorite(favorite);
            var req = {
                method: 'PUT',
                url: 'http://localhost:3000/private/privateInterest/sortedList',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
                data: {
                    'username': userService.getUsername(),
                    'sortedList': favorite
                }
            };
            $http(req).then(function success() {
                alert("Your list updated successfully");
            }, function error() {
                alert("A connection error occurred");
            });
        };
        //gets the clicked interest details
        $scope.getDetails = function (event) {
            let name = event.target.name;
            console.log("interest");
            interestDetails.getDetails($http, name, $window);
        };
    })
    //service for interests
    .service("interest", function () {
        let model = {};

        model.save = function ($http, userService, name) {
            var req = {
                method: 'POST',
                url: 'http://localhost:3000/private/privateInterest/addInterest',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
                data: {
                    'username': userService.getUsername(),
                    'interest': name
                }
            };
            $http(req).then(function success() {
                alert("Add point of interest successful")
            }, function error() {
                alert("A connection error occurred")
            });
        };

        model.remove = function ($http, userService, name) {
            var req = {
                method: 'DELETE',
                url: 'http://localhost:3000/private/privateInterest/removeInterests',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
                data: {
                    'userName': userService.getUsername(),
                    'interstName': name
                }
            };
            $http(req).then(function success() {
                alert("Interest point removed successfully")
            }, function error() {
                alert("A connection error occurred")
            });
        };
        model.sortMaxRank = function (favorites) {
            let sortedCategory = [];
            let count = favorites.length;
            for (let i = 0; i < count; i++) {
                let max = favorites[0];
                let index = 0;
                for (let j = 1; j < favorites.length; j++) {
                    if (max.rank < favorites[j].rank) {
                        max = favorites[j];
                        index = j;
                    }
                }
                favorites.splice(index, 1);
                sortedCategory.push(max);
            }
            return sortedCategory;
        };
        model.sortMinRank = function (favorites) {
            let sortedCategory = [];
            for (let i = 0; i < favorites.length; i++) {
                let min = favorites[i];
                if (!sortedCategory.includes(min)) {
                    for (let j = 1; j < favorites.length; j++) {
                        if (min.category === favorites[j].category && !sortedCategory.includes(favorites[j])) {
                            sortedCategory.push(favorites[j]);
                        }
                    }
                }
            }
            return sortedCategory;
        };
        model.sortCategory = function (favorites) {
            let sortedCategory = [];
            let count = favorites.length;
            for (let i = 0; i < count; i++) {
                let min = favorites[0];
                let index = 0;
                for (let j = 1; j < favorites.length; j++) {
                    if (min.rank > favorites[j].rank) {
                        min = favorites[j];
                        index = j;
                    }
                }
                favorites.splice(index, 1);
                sortedCategory.push(min);
            }
            return sortedCategory;
        };
        return model;
    });
