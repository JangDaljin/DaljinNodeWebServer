var http = require('http');
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')
    , cookieParser = require('cookie-parser')
    , cors = require('cors');

var D_route = require('./route/D_route')
    ,D_cloudroute = require('./route/D_cloudroute')
    ,D_calenderroute = require('./route/D_calenderroute')
    , D_mongoose = require('./D_database').D_Mongoose
    , D_passport = require('./D_passport')
    , D_setting = require('./D_setting');
    

var SERVER_HOSTNAME = D_setting.SOCKET_SETTING['HOSTNAME'];
var SERVER_PORT     = D_setting.SOCKET_SETTING['PORT'];

var app = express();


app.set('USER_SETTING' , D_setting.USER_SETTING);

app.set('views' , __dirname + '/views');
app.set('view engine' , 'ejs');

app.use('/scripts' , express.static(__dirname + '/views/scripts'));
app.use('/styles'  , express.static(__dirname + '/views/styles'));
app.use('/images'  ,express.static(__dirname + '/views/images'));


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

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(cors());

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use('/' , D_route(app));
app.use('/cloud' , D_cloudroute(app));
app.use('/calender' ,D_calenderroute(app));
D_route(app);


http.createServer(app).listen(SERVER_PORT, SERVER_HOSTNAME, function () {
   
    INIT(D_setting.PATH);
    D_mongoose.connect(app);

    console.log('[SERVER]READY');
});


var INIT = (PATH)=> {
    
    var fs = require('fs');

    Object.keys(PATH).forEach(
        (value , index) => {
            try {
                fs.mkdirSync(PATH[value]);
                console.log('[SERVER]' + PATH[value] + ' MAKE');
            }
            catch(e) {
                console.log('[SERVER]' + PATH[value] + ' ALREADY EXIST');
            }
        }
    );

}