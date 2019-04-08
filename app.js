var http = require('http');
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')
    , cookieParser = require('cookie-parser')
    , cors = require('cors');

var D_route = require('./D_route')
    , D_mongoose = require('./D_database').D_Mongoose
    , D_passport = require('./D_passport')
    , D_setting = require('./D_setting');
    

var SERVER_HOSTNAME = D_setting.SOCKET_SETTING['HOSTNAME'];
var SERVER_PORT     = D_setting.SOCKET_SETTING['PORT'];

var app = express();


app.set('USER_SETTING' , D_setting.USER_SETTING);

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

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

D_route(app);


http.createServer(app).listen(SERVER_PORT, SERVER_HOSTNAME, function () {
    D_mongoose.connect(app);
    console.log('SERVER_READY');
});