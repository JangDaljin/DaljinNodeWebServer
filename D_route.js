var passport = require('./D_passport');
var D_adduser = require('./D_adduser');
var D_file = require('./D_file');


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
            //res.render('file.ejs');
            res.writeHead('200' , {'Content-Type':'text/html;charset=utf8'});

            D_file.getList('./files/'+ req.user.id , (obj) =>{
                for(var i = 0; i < obj.length; i++) {
                    res.write('<p>' + obj[i]["name"] + '</p>')
                }
                res.end();
            });
        }
        else {
            res.redirect('/');
        }
    });

    app.post('/filelist'  ,(req , res) => {
        if(req.isAuthenticated()) {
            
        }
    });

    app.post('/fileupload' , (req , res)=> {

    });
    
    app.post('/filedownload' , (req , res) => {

    });

    app.post('/logout' , (req , res) => {
        res.logout();
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