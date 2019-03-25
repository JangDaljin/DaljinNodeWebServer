var http = require('http')
    

var express = require('express')
    , bodyparser = require('body-parser');

var D_config = require('./D_config')
    , D_mongoose = require('./database/D_mongoose').D_Mongoose
    , D_routerloader = require('./D_routeloader');


//express ����
var app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//���Ʈ ����
D_routerloader.init(app);

http.createServer(app).listen(D_config.SERVER_PORT, D_config.SERVER_HOSTNAME, function () {
    D_mongoose.connect();
});




