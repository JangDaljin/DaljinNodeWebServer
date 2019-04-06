var http = require('http');
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')
    , cookieParser = require('cookie-parser')
    , cors = require('cors');

var D_route = require('./D_route')
    ,D_mongoose = require('./D_database').D_Mongoose
    , D_passport = require('./D_passport');
    

var SERVER_HOSTNAME = 'localhost';
var SERVER_PORT = '3000';

var app = express();


app.set('USER_AUTH_CODE' , '0105');

app.set('views' , __dirname + '/views');
app.set('view engine' , 'ejs');

app.use(cookieParser());
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

app.use(cors());

D_route(app);


http.createServer(app).listen(SERVER_PORT, SERVER_HOSTNAME, function () {


    //console.log(test1());
    D_mongoose.connect(app);
});



var test1 = async () => {

    var res = 0 ;
    for(var i = 0 ; i < 1000; i++) {
        res += await test2(i);
    }
    return res;

}

var test2 = (num) => {
    var res = 0;

    for(var i = 0 ; i < 100; i++) {
        res += i;
    }
    console.log(num , res);
    return res;
}
