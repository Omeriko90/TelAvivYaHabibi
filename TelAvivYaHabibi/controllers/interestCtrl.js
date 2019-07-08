angular.module('interestCtrl', [])

    .controller("interestCtrl", function ($scope, $http, userService, $window, interestDetails, review, interest) {
        if (!userService.loggedIn()) {
            document.getElementById("popup").style.display = "block";
        }
        $scope.tokenVar = userService.getToken();
        $scope.username = userService.getUsername();
        $scope.interstSpecific = '';
        $scope.categoriesTemp = [];
        $scope.categoryFilter = [];
        $scope.categories = [];
        $scope.favoriteList = userService.getFavorite();
        $scope.ratingStars = [];
        $scope.sortByRank = [];
        $scope.favoriteLength = $scope.favoriteList.length;
        $scope.textReview = '';
        $scope.currentReview='';
        let clicked = false;
        let rating = 0;
        for (let i = 0; i < 5; i++) {
            $scope.ratingStars.push(document.getElementById("" + i));
        }
        //gets all the interest points
        $http.get("http://localhost:3000/publicInterest/getInterests").then(function (data) {
            for (let i in data.data.data) {
                $scope.categories.push(data.data.data[i]);
                if ($scope.sortByRank[data.data.data[i].category] === undefined) {
                    $scope.sortByRank[data.data.data[i].category] = [];
                    $scope.sortByRank[data.data.data[i].category].push(data.data.data[i])
                } else {
                    $scope.sortByRank[data.data.data[i].category].push(data.data.data[i]);
                }
            }
            $scope.categoriesTemp = $scope.categories;
        });
        //close the review window
        $scope.close = function () {
            document.getElementById("review").style.display = "none";
        };
        //opens the review window
        $scope.addReview = function (name) {
            $scope.currentReview = name;
            review.addReview();
        };
        //fill stars with yellow color
        $scope.fullStar = function (event) {
            let index = parseInt(event.target.id);
            for (; index >= 0; index--) {
                $scope.ratingStars[index].classList.add('fullStar');
            }
        };
        //sorts the interests from top rated down
        $scope.sortByMaxRank = function () {
            for (let i in $scope.sortByRank) {
                $scope.sortByRank[i] = interest.sortMaxRank($scope.sortByRank[i]);
            }
            $scope.categories = [];
            for (let j in $scope.sortByRank) {
                for (let k in $scope.sortByRank[j]) {
                    $scope.categories.push($scope.sortByRank[j][k]);
                }
            }
        };
        //sorts the interests from less rated to top
        $scope.sortByMinRank = function () {
            for (let i in $scope.sortByRank) {
                $scope.sortByRank[i] = interest.sortMinRank($scope.sortByRank[i]);
            }
            $scope.categories = [];
            for (let j in $scope.sortByRank) {
                for (let k in $scope.sortByRank[j]) {
                    $scope.categories.push($scope.sortByRank[j][k]);
                }
            }
        };
        //gets the selected rating for a review
        $scope.selectRating = function (event) {
            if (clicked) {
                let index = parseInt(event.target.id);
                rating = index+1;
                for (; index < 5; index++) {
                    $scope.ratingStars[index].classList.remove('fullStar');
                }
            }
            clicked = true;
            rating = parseInt(event.target.id) + 1;
            $scope.fullStar(event);
        };
        //fill stars with white color
        $scope.emptyStar = function (event) {
            if (!clicked) {
                let index = parseInt(event.target.id);
                for (; index >= 0; index--) {
                    $scope.ratingStars[index].classList.remove('fullStar');
                }
            }
        };
        //inserts the review into the DB
        $scope.sendReview = function () {
            let arr = $scope.textReview.split(" ");
            for(let i=0; i< arr.length;i++){
                arr[i] = arr[i].replace('"','');
                arr[i] = arr[i].replace("'","");
            }
            $scope.textReview = arr.join(" ");
            review.sendReview($http, userService, rating, $scope.textReview, $scope.currentReview);
            clicked = false;
            rating = 0;
            $scope.textReview = " ";
            for (let index = 0; index < 5; index++) {
                $scope.ratingStars[index].classList.remove('fullStar');
            }
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
            }
        };
        //updates the DB on the user favorite list
        $scope.saveToUser = function(){
          userService.updateFavoriteDB();
        };
        //gets the details of the clicked interest
        $scope.getDetails = function (event) {
            let name = event.target.name;
            console.log("interest");
            interestDetails.getDetails($http, name, $window);
        };
        //redirect to the user favorite page
        $scope.moveToFavorites = function(){
            $window.location.hash = '#!/favorites';
        };
        //search a specific interest
        $scope.searchInterest = function () {
            let found = false;
            $scope.categories = [];
            $scope.categories = $scope.categoriesTemp;
            for (c in $scope.categories) {
                if ($scope.categories[c].name == this.search) {
                    $scope.interstSpecific = $scope.categories[c];
                    found = true;
                }
            }
            if (!found) {
                alert("The specific interest not found");
                return;
            }
            $scope.categoriesTemp = [];
            $scope.categoriesTemp = $scope.categories;
            $scope.categories = [];
            $scope.categories.push($scope.interstSpecific);
        };
        //shows all the interests
        $scope.showAll = function () {
            $scope.categories = [];
            $scope.categories = $scope.categoriesTemp;
        };
        //show interests of a certain category
        $scope.chooseByCategory = function () {
            $scope.categories = [];
            let found = false;
            $scope.categories = $scope.categoriesTemp;
            for (let c in $scope.categories) {
                if ($scope.categories[c].category == this.chooseCategory) {
                    found = true;
                    $scope.categoryFilter.push($scope.categories[c]);
                }
            }
            if(!found){
                alert("Worng category.\nPlease choose another one");
                return;
            }
            $scope.categoriesTemp = [];
            $scope.categoriesTemp = $scope.categories;
            $scope.categories = [];
            $scope.categories = $scope.categoryFilter;
            $scope.categoryFilter = [];
        }
    })
    //service for the review
    .service("review", function () {
        let model = {};

        model.addReview = function () {
            document.getElementById("review").style.display = "block";
        };

        model.sendReview = function ($http, userService, rank, review, interestName) {
            var req = {
                method: 'PUT',
                url: 'http://localhost:3000/private/privateInterest/addReview',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
                data: {
                    'interestName': interestName,
                    'rankNumber': rank,
                    'verbelReview': review
                }
            };
            $http(req).then(function success(data) {
                document.getElementById("review").style.display = "none";
                alert("Review added successfully")
            }, function error() {
                alert("A problem occur");
            });
        };

        return model;
    })
    //service for the interests
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
        model.sortMaxRank = function (category) {
            let sortedCategory = [];
            for (let i = 0; i < 5; i++) {
                let max = category[0];
                let index = 0;
                for (let j = 1; j < category.length; j++) {
                    if (max.rank < category[j].rank) {
                        max = category[j];
                        index = j;
                    }
                }
                category.splice(index, 1);
                sortedCategory.push(max);
            }
            return sortedCategory;
        };
        model.sortMinRank = function (category) {
            let sortedCategory = [];
            for (let i = 0; i < 5; i++) {
                let min = category[0];
                let index = 0;
                for (let j = 1; j < category.length; j++) {
                    if (min.rank > category[j].rank) {
                        min = category[j];
                        index = j;
                    }
                }
                category.splice(index, 1);
                sortedCategory.push(min);
            }
            return sortedCategory;
        };
        return model;
    });
