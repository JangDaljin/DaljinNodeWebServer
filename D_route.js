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
            D_file.getList('./files/'+ req.user.id
            ,(obj) =>{
                res.render('file.ejs' , {data : obj});
            });
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/file/:dir'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var dir = req.params.dir;
            console.dir(dir);
            D_file.getList('./files/'+ req.user.id + '/' + dir
            ,(obj) =>{
                res.render('file.ejs' , {data : obj});
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