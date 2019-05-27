var passport = require('../D_passport');
var D_Mongoose = require('../D_database').D_Mongoose;

module.exports = function(app) {
    var router = require('express').Router();
    //========================================================================================================================================//
    //메인 페이지
    app.get('/' , (req , res) => {
        var output = {};
        if(req.isAuthenticated()) {
            output['email'] = req.user.email;
            output['nickname'] = req.user.nickname;
            output['grade'] = req.user.grade;
        }
        res.render('index.ejs' , output);
    });


    //네이버로그인
    app.get('/naverlogin' , passport.authenticate('naver'));
    app.get('/navercallback' , passport.authenticate('naver' , { 
        failureRedirect : '/'
    }) , (req , res) => {
        console.log("req.query.history = " + req.query.history);
        var history = encodeURIComponent(req.query.history) || "";
        if(history == null || history == "undefined") {
            history = '/';
        }
        res.redirect(history);
    });
    app.get('/navertokenlogin' , passport.authenticate('naver-token' , null) , (req , res) => {
            var output = {};
            output['result'] = false
            if(req.isAuthenticated()) {
                output['result'] = true;
                output['email'] = req.user.email;
                output['nickname'] = req.user.nickname;
                output['code'] = req.user.code;
                output['grade'] = req.user.grade;
                output['max_storage'] = req.user.max_storage;
            }
            res.send(JSON.stringify(output));
    });

    //세션 체크
    app.get('/sessioncheck' , (req ,res) => {
        var output = {};
        if(req.isAuthenticated()) {
            output['result'] = true;
            output['email'] = req.user.email;
            output['nickname'] = req.user.nickname;
            output['code'] = req.user.code;
            output['grade'] = req.user.grade;
            output['max_storage'] = req.user.max_storage;
        }
        else {
            output['result'] = false;
        }
        res.send(JSON.stringify(output));
    });

    //자신의 코드,닉네임 업데이트
    app.post('/userinfoupdate' , (req ,res) => {
         if(req.isAuthenticated()) {
            var email = req.user.email
            var nickname = req.body.nickname || "";
            var code = req.body.code || "";

            if(!nickname) {
                nickname = req.user.nickname;
            }
            if(!code) {
                code = req.user.code;
            }

            var output = {};
            output['error'] = true;
            D_Mongoose.userInfoUpdate(email , nickname , code).then(
                user => { 
                    if(user != null) {
                        req.session.passport.user = user;
                        output['error'] = false;
                        res.send(JSON.stringify(output));
                    }
                    else {
                        res.send(JSON.stringify(output));
                    }
                }
            );
        }
        else {
            res.end();
        }
    });

    app.post('/userwithdrawal' , (req ,res) => {
        if(req.isAuthenticated()) {
            var email = req.user.email;
            D_Mongoose.userDelete(email).then(
                (returnValue) => 
                {
                    var output = {};
                    output['error'] = returnValue;
                    res.send(JSON.stringify(output));
                }
            );
        }
        else {
            res.end();
        }
    });
    //========================================================================================================================================//


    //========================================================================================================================================//
    app.post('/logout' , (req , res) => {
        var output  = {};
        output['error'] = true;
        if(req.isAuthenticated()) {
            output['error'] = false
            req.logout();
        }
        res.send(JSON.stringify(output));
    });
    //========================================================================================================================================//



    //========================================================================================================================================//
    app.get('/logoHorizonImage' , (req ,res) => {
        require('fs').readFile('./views/daljin_logo_horizon.png' , (error , data) => {
            res.writeHead(200 , {'Content-Type' : 'text/html'});
            res.end(data);
        });
    });

    app.get('/naverloginImage' , (req ,res) => {
        require('fs').readFile('./views/naverloginbutton.png' , (error , data) => {
            res.writeHead(200 , {'Content-Type' : 'text/html'});
            res.end(data);
        });
    });

    return router;
}
