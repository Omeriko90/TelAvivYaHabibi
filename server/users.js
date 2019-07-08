var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");

let secret = 'secertPass';
/*
verify the username and password
 */

router.post('/login', function (req, res, next) {
    let username = req.body.username;
    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            let password = req.body.password;
            let dataToSend={};
            if(result.length==0){
                dataToSend['message']="Username or password isn't correct.\n Please check your credentials.";
                res.send(dataToSend);
            }

            else if (result[0].password.localeCompare(password)==0) {
                let payload = { id: 1, name: username, admin: true };
                let options = { expiresIn: "1d" };
                const token = jwt.sign(payload, secret, options);
                dataToSend['message']="Success";
                dataToSend['token']=token;
                dataToSend['user'] = result[0];
                    res.send(dataToSend);
            }
            else{
                dataToSend['message'] = "Wrong password.\nTry again";
                res.send(dataToSend);

            }
        });
});

/*
add new user to the db
 */
router.post('/addUser', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let city = req.body.city;
    let country = req.body.country;
    let lastName = req.body.lastName;
    let firstName = req.body.firstName;
    let email = req.body.email;
    let questions = req.body.questions;
    let answers = req.body.answers;
    let interestsCategory = req.body.interestsCategory;
    let sortedList = "";
    let dataToSend = {};
    DButilsAzure.execQuery("SELECT * FROM countries WHERE name='"+country+"'").then(countries =>{
       if(countries.length>0){
           return DButilsAzure.execQuery("INSERT INTO usersData (firstName,lastName,city,country,email,userName,password,sortedInterest) VALUES ('" + firstName + "','" + lastName + "','" + city + "','" + country + "','" + email + "','" + username + "','" + password + "'"+",'"+sortedList+"')");
       }
       else{
           dataToSend['message'] = "Wrong input!";
           res.send(dataToSend);
       }
    }).then( () => {
            for(let i=0;i<questions.length;i++){
                let q = questions[i].replace('"','');
                q = q.replace("'","");
                DButilsAzure.execQuery("INSERT INTO usersQuestion (userName,question,answer) VALUES ('" + username + "','" + q + "','" + answers[i] + "')")
            }
        }).then(() => {
        for(let i=0;i<interestsCategory.length;i++){
            DButilsAzure.execQuery("INSERT INTO usersCategory (userName,category) VALUES ('" + username + "','" + interestsCategory[i] + "')")
        }
        dataToSend['message']="Success";
        res.send(dataToSend);
    }).catch(err => {
        res.send(err);
    });
});

/*
  verify the answer to the restore question and send the password to the user
 */
router.post('/restorePass', function (req, res, next) {
    let username = req.body.username;
    let question = req.body.question;
    let answer = req.body.answer;
    let dataToSend={};
    DButilsAzure.execQuery("SELECT * FROM usersData WHERE userName='" + username + "'")
        .then(function (result) {
            if(result.length==0){
                dataToSend['message']="Username not exists.\n Please check your credentials.";
                res.send(dataToSend);
                return;
            }

            return DButilsAzure.execQuery("SELECT answer FROM usersQuestion WHERE userName='" + username + "' AND question='" + question + "'")
        }).then(ans => {
            if(answer.localeCompare(ans[0].answer)==0){
                return DButilsAzure.execQuery("SELECT password FROM usersData WHERE userName='" + username + "'")
            }
        dataToSend['message']="One of the elements is wrong.\nPlease try again";
            res.send(dataToSend);
    }).then(ans => {
        dataToSend['data']=ans;
        dataToSend['message']='Success';
        res.send(dataToSend);
    }).catch(err => {
        res.send(err);
    });

});
/*
     return question to identife the user according to forgot password action
*/
router.get('/forgotPassword/:userName',function(req,res){
    DButilsAzure.execQuery("SELECT * FROM usersQuestion WHERE userName='"+req.params.userName+"'")
        .then(function(result){
            let dataToSend={};
            if(result.length>0){
                let n=Math.floor(Math.random()*result.length);
                dataToSend['message']='Success';
                dataToSend['data']=result[n];
                res.send(dataToSend);
            }
            else{
                dataToSend['message'] ="This user is not exits";
                res.send(dataToSend);
            }
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

router.get('/countries',function(req,res){
    DButilsAzure.execQuery("SELECT name FROM countries")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        });
});
module.exports = router;
