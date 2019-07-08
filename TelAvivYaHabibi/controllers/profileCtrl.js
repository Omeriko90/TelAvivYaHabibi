angular.module('profileCtrl', [])

    .controller("profileCtrl", function ($http, $window, userService, interests, interestDetails) {
        let Controller = this;
        Controller.userInterest = [];
        Controller.noInterest = '';
        Controller.interestPoints = {};
        Controller.categories = {};
        Controller.interestRecommended = [];
        //gets all the interests
        let interestPromise = interests.getInterest($http);
        interestPromise.then(function (data) {
            if (data.data.message === 'Success') {
                for (let i = 0; i < data.data.data.length; i++) {
                    Controller.interestPoints[data.data.data[i].name] = data.data.data[i];
                    if (Controller.categories[data.data.data[i].category] === undefined) {
                        Controller.categories[data.data.data[i].category] = [];
                        Controller.categories[data.data.data[i].category].push(data.data.data[i]);
                    } else {
                        Controller.categories[data.data.data[i].category].push(data.data.data[i]);
                    }
                }
                Controller.loadRecommendations();
            }
        });
        //gets 2 interests points to recommend to the user
        Controller.loadRecommendations = function () {
            let categoryPromise = interests.getUserCategory($http, userService);
            categoryPromise.then(function (data) {
                if (data.data.message === 'Success') {
                    let index = 0;
                    if (data.data.data.length > 2) {
                        index = Math.floor(Math.random() * data.data.data.length);
                    }
                    for (let i = 0; i < 2; i++) {
                        let maxInCategory = interests.getMax(Controller.categories[data.data.data[index].category]);
                        Controller.interestRecommended.push(maxInCategory);
                        if (index < data.data.data.length - 1) {
                            index++;
                        } else {
                            index = 0;
                        }
                    }
                    Controller.loadUserIntrest();
                }
            });
        };
        //gets the last 2 interest points saved the user
        Controller.loadUserIntrest = function () {
            let promise = interests.getUserInterest($http, userService);
            promise.then(function (data) {
                if (data.data.message === 'Success') {
                    for (let i = 0; i < 2; i++) {
                        Controller.userInterest.push(Controller.interestPoints[data.data.data[i].interestName])
                    }
                } else {
                    Controller.noInterest = data.data.message;
                }
            });
        };
        //gets the details of the clicked interest
        Controller.getDetails = function (event) {
            let name = event.target.name;
            console.log("profile");
            interestDetails.getDetails($http, name, $window);
        };

    })

    .service("interests", function () {
        let model = {};
        //gets the users' saved interests points
        model.getUserInterest = function ($http, userService) {
            var req = {
                method: 'GET',
                url: 'http://localhost:3000/private/privateInterest/getTwoLastInterests/' + userService.getUsername(),
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
            };

            return $http(req);
        };
        //gets the users' favorite categories
        model.getUserCategory = function ($http, userService) {
            var req = {
                method: 'GET',
                url: 'http://localhost:3000/private/privateInterest/userCategory/' + userService.getUsername(),
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': userService.getToken()
                },
            };

            return $http(req);
        };
        model.getInterest = function ($http) {
            return $http.get("http://localhost:3000/publicInterest/getInterests");
        };
        model.getMax = function (category) {
            let max = category[0];
            for (let i = 1; i < category.length; i++) {
                if (max.rank < category[i].rank) {
                    max = category[i];
                }
            }
            return max;
        };


        return model;
    });