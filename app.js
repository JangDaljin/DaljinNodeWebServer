var http = require('http')
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')

var D_config = require('./D_config')
    , D_route = require('./D_route')
    , D_passport = require('./D_passport');



//express ¼³Á¤
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






http.createServer(app).listen(D_config.SERVER_PORT, D_config.SERVER_HOSTNAME, function () {
    
});




