var config = require('./D_config');
var express = require('express');
var router = express.Router();
var static = require('serve-static');
var path = require('path');
var routeloader = {

    init : function (app) {

        for (var i = 0; i < config.route.length; i++) {
            var curItem = config.route[i];

            var curType = curItem.type;
            var curPath = curItem.path;

            if (curType == 'post') {
                router.route(curPath).post(require(curItem.Module));
            }
            else if (curType == 'get') {
                router.route(curPath).get(require(curItem.Module));
            }
            else if (curType == 'redirect') {
                router.route(curPath).get(function (req, res) {
                    res.redirect('http://localhost:3000/page/index.html');
                });
            }
            else if (curType == 'static') {
                app.use(curItem.Module, static(path.join(__dirname, curPath)));
            }
        }



        app.use('/', router);
    }


};

module.exports = routeloader;