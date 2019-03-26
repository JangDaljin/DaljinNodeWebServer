var http = require('http')
    

var express = require('express')
    , bodyparser = require('body-parser')
    , expressSession = require('express-session')
    , passport = require('passport');

var D_config = require('./D_config')
    , D_route = require('./D_route');



//express ¼³Á¤
var app = express();

app.set('views' , __dirname + '/views');
app.set('view engine' , 'ejs');

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

D_route(app);




http.createServer(app).listen(D_config.SERVER_PORT, D_config.SERVER_HOSTNAME, function () {
    
});




