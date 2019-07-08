var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');

/*
    return 3 random interests with ranking over 50%
*/
router.get('/getRandomInterests', function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM interestList WHERE rank > 50")
        .then(function (result) {
            if (result.length >= 3) {
                let interests = [];
                while (interests.length < 3) {
                    let index = Math.floor(Math.random() * result.length);
                    interests.push(result[index]);
                    result.splice(index, 1);
                }
                res.send(interests);
            } else {
                res.send(result);
            }
        }).catch(function (err) {
        console.log(err);
    });
});

/*
  return list of interest according to category chosen by the user
*/
router.get('/searchInterests/:interstName', function (req, res) {
    DButilsAzure.execQuery("SELECT name FROM interestList WHERE category='" + req.params.interstName + "'")
        .then(function (result) {
            if (result.length > 0) {
                res.send(JSON.stringify(result));
            } else {
                let message = "Interests not found for " + req.params.interstName + " category";
                res.send(JSON.stringify(message))
            }
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
});

/*
    gets the interest details
 */
router.get('/interestDetails/:interestName', function (req, res) {
    let interestName = req.params.interestName;
    let details;
    DButilsAzure.execQuery("SELECT * FROM interestList WHERE name='" + interestName + "'")
        .then(function (result) {
            if (result.length > 0) {
                details = result;
                let views = result[0].numOfView;
                views++;
                return DButilsAzure.execQuery("UPDATE interestList SET numOfView=" + views + " WHERE name='" + interestName + "'")
            }
            res.send("interest not exits")
        }).then(() => {
        return DButilsAzure.execQuery("SELECT * FROM interestReview WHERE nameInterest='" + interestName + "'")
    }).then(data => {
        if (data.length > 0) {
            let reviews = getTwoLast(data);
            details.push(reviews);

        }
        else{
            details.push(["There is no reviews for this interest"]);
        }
        res.send(details);
    }).catch(function (err) {
        console.log(err);
    });
});

router.get('/getInterests', function (req, res) {
    let dataToSend={};
    DButilsAzure.execQuery("SELECT * FROM interestList")
        .then(function (result) {
            dataToSend['message']="Success";
            dataToSend['data']=result;
            res.send(dataToSend);

        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
});

function getTwoLast(data) {
    let latestsReview = [];
    let index = 1;
    if(data[0].length>=2){
        index=2;
    }
    for (let i = 0; i < index; i++) {
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