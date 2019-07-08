var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
var dateTime = require('node-datetime');

/*
    adds new interest to a user
*/
router.post('/addInterest', function (req, res, next) {
    let username = req.body.username;
    let interest = req.body.interest;

    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            if (result.length > 0) {
                var dt = dateTime.create();
                var formatted = dt.format('Y-m-d');
                return DButilsAzure.execQuery("INSERT INTO usersInterest (username,interestName,date) VALUES('" + username + "'," + "'" + interest + "','" + formatted + "')")
            }

            res.send("User isn't exists.\nPlease check the username entered and try again.");

        }).then(() => {
        return DButilsAzure.execQuery("SELECT sortedInterest FROM usersData WHERE userName='" + username + "'")
    }).then(list => {
        let newList = list[0].sortedInterest;
        if (newList.length > 0) {
            newList = list[0].sortedInterest + "," + interest;
        }
        else{
            newList = interest;
        }
        return DButilsAzure.execQuery("UPDATE usersData SET sortedInterest='" + newList + "' WHERE username='" + username + "'");
    }).then(() => {
        res.send("Interest added successfully");
    }).catch(err => {
        console.error(err);
    });
});

/*
returns all the user interests
 */
router.get('/userInterest/:username', function (req, res, next) {
    let username = req.params.username;
    let dataToSend = {};
    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            if (result.length > 0 && result.length < 2) {
                return DButilsAzure.execQuery("SELECT interestName FROM usersInterest WHERE username='" + username + "'")
            }
            dataToSend['message'] = "User isn't exists.\nPlease check the username entered and try again.";
            res.send(dataToSend)
        }).then(data => {
        if (data.length == 0) {
            dataToSend['message'] = "User has no Interests saved";
            res.send(dataToSend);
        } else {
            dataToSend['message'] = "Success";
            dataToSend['data'] = data;
            res.send(dataToSend);
        }
    });
});

router.get('/userCategory/:username', function (req, res, next) {
    let username = req.params.username;
    let dataToSend = {};
    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            if (result.length > 0 && result.length < 2) {
                return DButilsAzure.execQuery("SELECT * FROM usersCategory WHERE userName='" + username + "'")
            }
            dataToSend['message'] = "User isn't exists.\nPlease check the username entered and try again.";
            res.send(dataToSend)
        }).then(data => {
        if (data.length == 0) {
            dataToSend['message'] = "User has no favorite categories ";
            res.send(dataToSend);
        } else {
            dataToSend['message'] = "Success";
            dataToSend['data'] = data;
            res.send(dataToSend);
        }
    });
});


/*
   remove interest from the user's list of interest
*/
router.delete('/removeInterests', function (req, res) {
    let userName = req.body.userName;
    let interest = req.body.interstName;
    DButilsAzure.execQuery("DELETE FROM usersInterest WHERE username='" + userName + "' AND interestName='" + interest + "'")
        .then(function (result) {
            let message = interest + " Successfully deleted";
            res.send(message)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});

/*
    add review to specific interest
*/
router.put('/addReview', function (req, res) {
    let interestName = req.body.interestName;
    let rankNumber = req.body.rankNumber;
    let verbelReview = req.body.verbelReview;
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d');
    DButilsAzure.execQuery("INSERT INTO interestReview (nameInterest,rank,verbelReview,date) VALUES('" + interestName + "','" + rankNumber + "','" + verbelReview + "','" + formatted + "')")
        .then(function (result) {
            let message = "Review successfully added";
            res.send(message)
        })
        .catch(function (err) {
            res.send(err)
        });
    getTotalPrecentRank(interestName)
});

/*
    return two last interested
*/
router.get('/getTwoLastInterests/:userName', function (req, res) {
    let dataToSend = {};
    DButilsAzure.execQuery("SELECT * FROM usersInterest WHERE username='" + req.params.userName + "'")
        .then(function (result) {
            if (result.length > 0) {
                dataToSend['data'] = getTwoLast(result);
                dataToSend['message'] = 'Success';
                res.send(dataToSend)
            } else {
                dataToSend['message'] = "The user doesn't have any interests";
                res.send(dataToSend)
            }
        })
        .catch(function (err) {
            res.send(err);
        })
});

/*
    puts the updated interest list according to the user list
 */
router.put('/sortedList', function (req, res) {
    let interestList = req.body.sortedList;
    let username = req.body.username;
    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            if (result.length > 0) {
                return DButilsAzure.execQuery("UPDATE usersData SET sortedInterest='" + interestList + "' WHERE username='" + username + "'");
            }
            res.send("User isn't exists.\nPlease check the username entered and try again.")
        }).then(() => {
        res.send("List has been update successfully");
    }).catch(function (err) {
        res.send(err);
    });

});

function getTotalNumberPrecentRank(interest) {
    return new Promise((resolve, reject) => {
        let total = 0;
        DButilsAzure.execQuery("SELECT rank FROM interestReview WHERE nameInterest='" + interest + "'")
            .then(function (result) {
                let sum = 0;
                for (let i = 0; i < result.length; i++) {
                    let res = result[i];
                    sum = sum + res.rank;
                }
                let avg = sum / result.length;
                total = (avg / 5) * 100;
                resolve({total: total});
            })
            .catch(function (err) {
            })
    });
}

async function getTotalPrecentRank(interest) {
    try {
        const res = await getTotalNumberPrecentRank(interest);
        DButilsAzure.execQuery("UPDATE interestList SET rank=" + res.total + " WHERE name='" + interest + "'")
            .then(function (result) {
            })
            .catch(function (err) {
            })
    } catch (error) {
        console.log(error.message);
    }
}

function getTwoLast(data) {
    let latestsReview = [];
    for (let i = 0; i < 2; i++) {
        let lastest = data[0].date;
        let latestIndex = 0;
        for (let j = 1; j < data.length; j++) {
            if (lastest < data[j].date) {
                lastest = data[j].date;
                latestIndex = j;
            }
        }
        latestsReview.push(data[latestIndex]);
        data.splice(latestIndex, 1);
    }
    return latestsReview;
}

module.exports = router;
