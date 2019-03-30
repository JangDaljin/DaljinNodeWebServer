var passport = require('./D_passport');
var D_adduser = require('./D_adduser');
var D_file = require('./D_file');
var path = require('path');


var D_Authenticated = (req , res , red) => {

}

module.exports = function(app) {

    app.get('/' , (req , res) => {
        if(req.isAuthenticated()) {
            res.redirect('/file');
        }
        else {
            res.render('login.ejs');
        }
    });

    app.post('/login' , passport.authenticate('login' , {
        successRedirect : '/file',
        failureRedirect : '/'
    }));

    app.get('/file'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.query.path || '';
            //console.log('id : %s , path : %s', id , path);
            D_file.getList('./files/'+ id + path
            ,(err , FILE_INFO) =>{
                obj = {};
                if(err) {
                    obj['query'] = '';
                }
                else {
                    obj['query'] = '?path='+ path;
                }
                obj['file'] = FILE_INFO;

                console.dir(obj);
                res.render('file.ejs' , {data : obj});
            });
        }
        else {
            res.redirect('/');
            
        }
    });

    //WEB 이외 요청
    app.post('/fileList'  ,(req , res) => {
        if(req.isAuthenticated()) {
            
        }
        else {

        }
    });

    
    app.post('/fileUpload' , (req , res)=> {

    });

    //파일다운로드
    app.post('/fileDownload/' , (req , res) => {
        if(req.isAuthenticated()) {
            var downloadList = req.body.downloadList || '';
            
            var list_JSON = JSON.parse(downloadList);
            var list_length = Object.keys(list_JSON).length;
            
            for(var i = 0 ; i < list_length; i++) {
                res.download(path.join(__dirname, 'files' , req.user.id, list_JSON[i]) , list_JSON[i] , (err) => {
                    if(err) {
                        console.dir(err);
                    }
                });


            }
            
        }
        else {
            console.log('Download authenticate error');
        }
    });

    app.get('/logout' , (req , res) => {
        if(req.isAuthenticated()) {
            req.logout();
        }
        res.redirect('/');
    });

    app.get('/adduser' , (req , res) => {
        res.render('adduser.ejs');
    });

    app.post('/adduser' , (req , res)=> {
        D_adduser(req , res , (err) => {
            if(err) {
                res.redirect('/adduser');
            }
            else {
                res.redirect('/');
            }
        });
    });

}