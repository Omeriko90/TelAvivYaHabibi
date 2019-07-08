const express=require("express");
var DButilsAzure = require('./DButils');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
var cors = require('cors');
const jwt = require("jsonwebtoken");
const app=express();

let secret = 'secertPass';

const port = 3000; //environment variable

app.use(cors());
app.options('*',cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var usersRouter = require('./users');
var privateInterestRouter = require('./privateInterest');
var publicInterestRouter = require('./publicInterest');
// app.all('/*', function(req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
// 	next();
// });
app.use('/private',function (req,res,next) {
	const token = req.header("x-auth-token");
	// no token
	if (!token) res.status(401).send("Access denied. No token provided.");
	// verify token
	try {
		const decoded = jwt.verify(token, secret);
		req.decoded = decoded;
		next();
	} catch (exception) {
		res.status(400).send("Invalid token.");
	}
});

app.use('/private/privateInterest', privateInterestRouter);
app.use('/publicInterest', publicInterestRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});


module.exports = app;
