var http = require('http')
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')

var D_route = require('./D_route')
    ,D_mongoose = require('./D_database').D_Mongoose
    , D_passport = require('./D_passport');
    

var SERVER_HOSTNAME = 'localhost';
var SERVER_PORT = '3000';

//express ����
var app = express();

app.set('views' , __dirname + '/views');
app.set('view engine' , 'ejs');

app.use(expressSession(
    {
        secret : 'daljin',
        resave : false,
        saveUninitialized : true
    }
));
app.use(D_passport.initialize());
app.use(D_passport.session());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


D_route(app);


http.createServer(app).listen(SERVER_PORT, SERVER_HOSTNAME, function () {
    D_mongoose.connect(app);
});




