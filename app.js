var http = require('http')
    , path = require('path');


var app = require('express')
    ,router = app.Router()
    , serveStatic = require('serve-static');
    , 


var D_globalconfig = require('./D_globalconfig')
    , D_mongoose = require('./database/D_mongoose').D_Mongoose;






http.createServer(app).listen(D_globalconfig.SERVER_PORT, D_globalconfig.SERVER_HOSTNAME, function () {
    D_mongoose.connect();
});




