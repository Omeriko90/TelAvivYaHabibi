angular.module('detailCtrl', [])

    .controller('detailCtrl', function ($window, $http, userService,interestDetails) {
        var Controller = this ;
        Controller.details = interestDetails.sendDetails();
        Controller.interest = Controller.details[0];
        Controller.reviews = Controller.details[1];
        Controller.favorites = userService.getFavorite();
        Controller.username = userService.getUsername();
        if(Controller.favorites.includes(Controller.interest.name)){
            document.getElementsByClassName("fa-star")[0].classList.add("fullStar");
        }
        //Loads the map and the coordinates
        // The location of Uluru
        var uluru = {lat: parseFloat(Controller.interest.latitude), lng: parseFloat(Controller.interest.longitude)};
        // The map, centered at Uluru
        var map = new google.maps.Map(
            document.getElementById('map'), {zoom: 17, center: uluru});
        // The marker, positioned at Uluru
        var marker = new google.maps.Marker({position: uluru, map: map});

        Controller.save = function (event) {
            var req;
            if (!event.target.classList.contains("fullStar")) {
                event.target.classList.add("fullStar");
                req = {
                    method: 'POST',
                    url: 'http://localhost:3000/private/privateInterest/addInterest',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': userService.getToken()
                    },
                    data: {
                        'username': userService.getUsername(),
                        'interest': Controller.interest.name
                    }
                };
                $http(req).then(function success() {
                    userService.addFavorite(Controller.interest.name);
                    alert("Add point of interest successful");
                }, function error() {
                    alert("A connection error occurred")
                });
            } else {
                event.target.classList.remove("fullStar");
                req = {
                    method: 'DELETE',
                    url: 'http://localhost:3000/private/privateInterest/removeInterests',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': userService.getToken()
                    },
                    data: {
                        'userName': userService.getUsername(),
                        'interstName': Controller.interest.name
                    }
                };
                $http(req).then(function success() {
                    userService.removeFavorite(Controller.interest.name);
                    alert("Interest point removed successfully")
                }, function error() {
                    alert("A connection error occurred")
                });
            }
        }
    });