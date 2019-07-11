angular.module('userCtrl', [])

    .controller("userCtrl", function ($http, $window, restoreQuestion, checkOnlyLetter, userService, interestDetails) {
        if (userService.getUsername() == null) {
            userService.start();
        }
        let Controller = this;
        Controller.randomInterests = [];
        //gets random interests points for the footer
        let promise = $http.get('http://localhost:3000/publicInterest/getRandomInterests');
        promise.then(function (data) {
            for (let i in data.data) {
                Controller.randomInterests.push(data.data[i]);
            }
        });
        //close the model popup
        Controller.modalClose = function () {
            document.getElementById("popup").style.display = "none";
        };
        //gets the details of the clicked interest
        Controller.getDetails = function (event) {
            console.log("user");
            interestDetails.getDetails($http, event.target.name, $window);
        };
        Controller.welcomeMessage = userService.getUsername();
        Controller.firstname = '';
        Controller.token = '';
        Controller.lastname = '';
        Controller.username = '';
        Controller.passwordLogin = '';
        Controller.nameLogin = '';
        Controller.password = '';
        Controller.city = '';
        Controller.country = '';
        Controller.email = '';
        Controller.restaurant = '';
        Controller.nightLife = '';
        Controller.shopping = '';
        Controller.attraction = '';
        Controller.countries = [];
        Controller.category = [];
        Controller.restoreQuestion = '';
        Controller.userRestoreAnswer = '';
        Controller.restoredPassword = '';
        Controller.question = [];
        Controller.answer = [];
        Controller.register = {
            "firstname": Controller.firstname,
            "lastname": Controller.lastname,
            "username": Controller.username,
            "password": Controller.password,
            "countrySpan": Controller.country,
            "city": Controller.city,
            "email": Controller.email,
            "questionSpan": Controller.question,
            "answerSpan": Controller.answer,
            "category": Controller.category
        };
        //adds the selected country to user
        Controller.nextPage = function () {
            Controller.country = Controller.currentCountry;
        };
        //adds selected category to the user
        Controller.addCategory = function (category) {
            Controller.category.push(category);
        };
        //adds a restore question and answer to the users' restore questions
        Controller.addQuestion = function () {
            if (Controller.question.length == 0 || Controller.answer.length == 0 || Controller.question[Controller.question.length - 1] === '' || Controller.answer[Controller.answer.length - 1] === '') {
                alert("Fill both question and answer before adding another question")
            } else {
                restoreQuestion.add();
            }
        };
        //gets the users' restore questions and peeks 1 to show to the user
        Controller.getRestoreQuestion = function () {
            $http.get('http://localhost:3000/users/forgotPassword/' + Controller.nameLogin).then(function (ans) {
                if (ans.data.message == 'Success') {
                    Controller.restoreQuestion = ans.data.data;
                } else {
                    alert(ans.data.message);
                }
            }, function error() {
                alert("A connection error occurred")
            });
        };
        //checks if the answer is ok and returns the password to the user
        Controller.restorePass = function () {
            if (Controller.userRestoreAnswer === Controller.restoreQuestion.answer) {
                var req = {
                    method: 'POST',
                    url: 'http://localhost:3000/users/restorePass',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "username": Controller.nameLogin,
                        "question": Controller.restoreQuestion.question,
                        "answer": Controller.restoreQuestion.answer
                    }
                };
                $http(req).then(function success(ans) {
                    if (ans.data.message == 'Success') {
                        Controller.restoredPassword = ans.data.data[0].password;
                    } else {
                        alert(ans.data.message);
                    }
                }, function error() {
                    alert("A connection error occurred")
                });
            } else {
                alert("Wrong answer!\nPlease try again.")
            }
        };
        //login
        Controller.loginNow = function () {
            var req = {
                method: 'POST',
                url: 'http://localhost:3000/users/login',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "username": Controller.nameLogin,
                    "password": Controller.passwordLogin,
                }
            };
            $http(req).then(function success(ans) {
                if (ans.data.message == 'Success') {
                    document.getElementById("register").style.display = "none";
                    document.getElementById("login").style.display = "none";
                    document.getElementById("logout").style.display = "block";
                    Controller.welcomeMessage = Controller.nameLogin;
                    document.getElementById('brand').innerHTML = "Hello " + Controller.nameLogin;
                    userService.setUsername(Controller.nameLogin);
                    userService.setFavorite(ans.data.user.sortedInterest);
                    Controller.token = ans.data.token;
                    userService.setToken(Controller.token);
                    $window.location.hash = '#!/profile';
                } else {
                    alert(ans.data.message);
                }
            }, function error() {
                alert("A connection error occurred")
            });
        };
        //checks that a string contains only letters
        Controller.checkLetter = function (event) {
            checkOnlyLetter.check(event);
        };
        //logs out of the user account
        Controller.logOut = function () {
            document.getElementById("register").style.display = "block";
            document.getElementById("login").style.display = "block";
            document.getElementById("logout").style.display = "none";
            Controller.welcomeMessage = 'Guest';
            let favorite = '';
            let favoriteArr = userService.getFavorite();
            for (let i = 0; i < favoriteArr.length; i++) {
                if (i < favoriteArr.length - 1) {
                    favorite += favoriteArr[i] + ',';
                } else {
                    favorite += favoriteArr[i];
                }
            }
            userService.updateFavoriteDB($http, favorite);
            userService.clearSession();
        };
        //validate that the new user inserted all the fields correctly and sign him up
        Controller.validateUser = function (isValid) {
            if (Controller.category.length < 2) {
                isValid = false;
            }
            if (isValid) {
                for (let i in Controller.register) {
                    if (i === 'questionSpan' || i === 'answerSpan') {
                        let spans = document.getElementsByName(i);
                        for (var j = 0; j < spans.length; j++) {
                            spans[j].style.display = "none";
                        }
                    } else {
                        let current = document.getElementById(i);
                        current.style.display = "none";
                    }
                }
                var req = {
                    method: 'POST',
                    url: 'http://localhost:3000/users/addUser',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "firstName": Controller.firstname,
                        "lastName": Controller.lastname,
                        "city": Controller.city,
                        "country": Controller.country,
                        "email": Controller.email,
                        "username": Controller.username,
                        "password": Controller.password,
                        "interestsCategory": Controller.category,
                        "questions": Controller.question,
                        "answers": Controller.answer
                    }
                };
                $http(req).then(function success() {
                    $window.location.hash = '#!/login';
                }, function error() {
                    alert("A connection error occurred")
                });
            } else {
                for (var i in Controller.register) {
                    if (i === 'questionSpan' || i === 'answerSpan') {
                        continue;
                    } else if (i === 'category' && Controller.category.length < 2) {
                        let current = document.getElementById(i);
                        current.style.display = "block";
                    } else if (Controller.register[i] === '') {
                        let current = document.getElementById(i);
                        current.style.display = "block";
                    }
                    if (Controller.register['questionSpan'].length != Controller.register['answerSpan'].length) {
                        if (Controller.register['questionSpan'].length > Controller.register['answerSpan'].length) {
                            let answerSpan = document.getElementsByName('answerSpan');
                            answerSpan[answerSpan.length - 1].style.display = "block";
                        } else {
                            let questionSpan = document.getElementsByName('questionSpan');
                            questionSpan[questionSpan.length - 1].style.display = "block";
                        }
                    }
                }
                alert("You didn't finish your registration form.\nPlease fill all the fields before submitting.")
            }
        };
        Controller.questions = restoreQuestion.questions;
        //gets all the countries from the DB
        $http.get('http://localhost:3000/users/countries').then(function (ans) {
            for (let i in ans.data) {
                Controller.countries.push(ans.data[i]);
            }
        })
    })

    //service for checking string to contain only letters
    .service("checkOnlyLetter", function () {
        let ans = true;
        this.check = function (inputtxt) {
            if ((inputtxt.target != null) && ((String)(inputtxt.target.value).match("^[ a-zA-Z]*$"))) {
                ans = true;
                inputtxt.target.nextElementSibling.style.display = "none";
            } else {
                inputtxt.target.nextElementSibling.style.display = "block";
                ans = false;
            }

            return ans;
        };
    })
    //service for restoring questions
    .service("restoreQuestion", function () {
        let addQuestion = {};
        let question = {
            q: "",
            ans: ""
        };
        let defaultQues = Object.create(question);
        addQuestion.questions = [];
        addQuestion.questions.push(defaultQues);
        addQuestion.add = function () {
            let q = Object.create(question);
            addQuestion.questions.push(q);
        };
        return addQuestion;
    });

   