var passport = require('./D_passport');
var D_adduser = require('./D_adduser');
var D_file = require('./D_file');
var path = require('path');

var multer = require('multer');


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

    //파일 페이지 요청
    app.get('/file'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.query.path || '';
            D_file.getList('./files/'+ id + path
            ,(err , FILE_INFO) =>{
                obj = {};
                if(err) {
                    obj['query'] = '';
                }
                else {
                    obj['query'] = path;
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

    //WEB 이외 파일리스트 요청
    app.post('/fileList'  ,(req , res) => {
        if(req.isAuthenticated()) {
            
        }
        else {

        }
    });

    var upload = multer({
        storage : multer.diskStorage({
            destination : (req , file , callback) => {
                callback(null , './files/uploads');
            },
            filename : (req , file , callback) => {
                callback(null , file.originalname + '_' + req.user.id);
            }
        })
    });

    //파일 업로드 요청
    app.post('/fileUpload' , upload.array('files'), (req , res)=> {
        var id = req.user.id;
        var path = req.body.path || '';
        var files = req.files;

        for(var i = 0 ; i < req.files.length; i++) {
            console.log('source : ' + '/files/uploads/' + files[i].originalname+'_'+id);
            console.log('destination : ' + '/files/'+id+path);

            D_file.moveTo('./files/uploads/'+files[i].filename  , './files/'+id+path+'/'+files[i].originalname);
        }

        
        res.redirect('/file' + '?path=' + path);
    });

    //파일다운로드 처리
    app.post('/fileDownload/' , (req , res) => {
        if(req.isAuthenticated()) {

            //jQuery.fileDownload.js 사용을 위한 쿠키설정
            res.setHeader("Set-Cookie", "fileDownload=true; path=/");

            var downloadFile = req.body.downloadFile || '';
            console.dir(downloadFile);
                res.download(path.join(__dirname, 'files' , req.user.id, downloadFile) , downloadFile , (err) => {
                    if(err) {
                        console.dir(err);
                    }
                    else {
                        console.log('file send complete');
                    }
                });
            
        }
        else {
            console.log('Download authenticate error');
        }
    });

    //로그아웃 처리
    app.get('/logout' , (req , res) => {
        if(req.isAuthenticated()) {
            req.logout();
        }
        res.redirect('/');
    });

    //유저추가 페이지
    app.get('/adduser' , (req , res) => {
        res.render('adduser.ejs');
    });


    //유저추가 처리
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