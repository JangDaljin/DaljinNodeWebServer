var passport = require('./D_passport');
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
    app.post('/fileList'  ,(req , res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.require_path || '';
            D_file.getList('./files/'+ id + path
            ,(err , FILE_INFO) =>{
                obj = {};
                if(err) {
                    res.send(null);
                }
                else {
                    res.send(JSON.stringify(FILE_INFO));
                }
            });
        }
        else {
            res.redirect('/');
        }
    });

    //파일리스트 요청
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

                //console.dir(obj);
                res.render('file.ejs' , {data : obj});
            });
        }
        else {
            res.redirect('/');
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
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.uploadPath || '';
            var files = req.files;
    
            for(var i = 0 ; i < req.files.length; i++) {
                console.log('source : ' + '/files/uploads/' + files[i].originalname+'_'+id);
                console.log('destination : ' + '/files/'+id+path);
    
                D_file.moveTo('./files/uploads/'+files[i].filename  , './files/'+id+path+'/'+files[i].originalname);
            }
            res.redirect('/file' + '?path=' + path);
        }
        else {
            res.redirect('/');
        }
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

    //폴더 만들기
    app.post('/makeDirectory' , (req, res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.dirPath || '';
            var name = req.body.dirName || '';
            
            if(name != '')  {
                D_file.makeDirectory('./files/'+ id + path + '/' + name , (err)=>{
                    if(err) {
                        console.log('folder make error');
                    }
                    else {
                        res.redirect('/file' + '?path=' + path);
                    }
                });
            }
            else {
                res.end();
            }
        }
        else {
            res.redirect('/');
        }
    });

    //파일 지우기 처리
    app.post('/fileDelete' , (req ,res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var deletePath = req.body.deletePath || '';
            var deleteFileList = JSON.parse(req.body.deleteFileList || '');
            var deleteFileList_length = Object.keys(deleteFileList).length;

            for(var i = 0 ; i < deleteFileList_length; i++) {
                D_file.moveTo('./files/' + id + deletePath + '/' + deleteFileList[i] , './files/trash_bin/'+deleteFileList[i] + '_' + id);
            }
            res.redirect('/file' + '?path=' + deletePath);
        }
        else {
            res.redirect('/');
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
        var param = req.query.param || '';
        res.render('adduser.ejs' , {'param' : param});
    });

    //유저추가 처리
    app.post('/adduser' , (req , res)=> {
        var ID = req.body.ID || req.query.ID;
        var PW = req.body.PW || req.query.PW;
        var CODE = req.body.CODE || req.query.CODE;
    
    
        if(CODE != req.app.get('USER_AUTH_CODE')) {
            res.redirect('/adduser?param=CODE');
        }
        else {
            var D_UserModel = req.app.get('D_UserModel');
    
            var UserModel = new D_UserModel(
                {
                    id : ID,
                    password : PW
                }
            );
        
            UserModel.save((err)=> {
                console.log('USER_ID : ' + ID + ' ' + 'USER_PW : ' + PW);
                if(err) {
                    res.redirect('/adduser?param=IDPW');
                }
                else {
                    D_file.makeDirectory('./files/'+ ID);

                    res.redirect('/adduser?param=SUCCESS');
                }
            });
        }
    });

}