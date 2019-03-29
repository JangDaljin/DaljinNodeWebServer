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
            res.redirect('/file/'+req.user.id);
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/file/:id'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.params.id;
            var path = req.query.path || '';
            console.log('id : %s , path : %s', id , path);
            D_file.getList('./files/'+ id + path
            ,(err , FILE_INFO) =>{
                obj = {};
                if(err) {
                    obj['query'] = '';
                }
                else {
                    obj['query'] = id + '?path='+ path;
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

    app.post('/filelist'  ,(req , res) => {
        if(req.isAuthenticated()) {
            
        }
    });

    app.post('/fileupload' , (req , res)=> {

    });
    
    app.post('/filedownload' , (req , res) => {

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