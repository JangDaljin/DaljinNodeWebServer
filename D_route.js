﻿var passport = require('./D_passport');
var D_file = require('./D_file');
var path = require('path');
var multer = require('multer');
var archiver = require('archiver');

module.exports = function(app) {


    //메인 페이지
    app.get('/' , (req , res) => {
        if(req.isAuthenticated()) {
            res.redirect('/file');
        }
        else {
            res.render('login.ejs');
        }
    });

    //로그인 처리
    app.post('/login' , passport.authenticate('login' , {
        successRedirect : '/file',
        failureRedirect : '/'
    }));

    //파일 페이지
    app.post('/fileList'  ,(req , res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.require_path || '';
            D_file.getList('./files/'+ id + path).then(
                (reutrnValue) => 
                {
                    obj = {};
                    res.send(JSON.stringify(returnValue));
                }
            );
        }
        else {
            res.redirect('/');
        }
    });

    //파일 페이지
    app.get('/file'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var max_storage = req.user.max_storage;
            var path = req.query.path || '';

            D_file.getList('./files/' + id + path).then(
                (returnValue) => 
                {   
                    if(returnValue == null) {
                        res.redirect('/');
                    }
                    else {
                        obj = {};
                        obj['path'] = path;
                        obj['files'] = returnValue;
                        obj['max_storage'] = max_storage;
                        obj['used_storage'] = D_file.getTotalSizeOnRoot((require('path').join(__dirname , 'files' , id)))
                        res.render('file.ejs' , {data : JSON.stringify(obj)});
                    }
                }
            );
        }
        else {
            res.redirect('/');
        }
    });


    //업로드 미들웨어 설정
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
    app.post('/fileUpload' , upload.array('n_upload_files'), (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            
            var path = req.body.n_upload_path || '';
            var files = req.files;
    
            for(var i = 0 ; i < req.files.length; i++) {
                D_file.moveTo('./files/uploads/'+files[i].filename  , './files/'+id+path+'/'+files[i].originalname).then(
                    (returnValue) => 
                    {
                        console.log('[' + id + '] UPLOAD COMPLETE');
                    }
                );
            }
            res.redirect('/file' + '?path=' + path);
        }
        else {
            res.redirect('/');
        }
    });

    //파일다운로드 처리
    app.post('/Download/' , (req , res) => {
        if(req.isAuthenticated()) {

            var id =  req.user.id;
            var downloadItem    = req.body.n_downloadItem     || '';
            var type            = req.body.n_itemType         || ''; 

            //jQuery.fileDownload.js 사용을 위한 쿠키설정
            res.setHeader("Set-Cookie", "fileDownload=true; path=/");

            //폴더일 경우 ZIP 변경
            if(type == 'directory') {
                res.setHeader('Content-Type' , "application/zip");
                res.setHeader('Content-Disposition', 'attachment; filename=' + downloadItem.substring(1,downloadItem.length) + '.zip');
                var archive = archiver('zip');
                new Promise(
                    () => {
                    archive
                    .directory(path.join(__dirname, 'files' , id, downloadItem), false)
                    .on('error', (err) => {
                        archive.close()
                        console.log('[' + id + ']files/' + id + '/' + downloadItem + ' FOLDER(ZIP) SEND ERROR');
                    })
                    .pipe(res);
                
                    res.on('finish', 
                    () => {
                        console.log('[' + id + ']files/' + id + '/' + downloadItem + ' FOLDER(ZIP) SEND COMPLETE');
                    });
                    archive.finalize();
                });
            }
            else if(type == 'file'){
                
                res.download(path.join(__dirname, 'files' , id, downloadItem) , downloadItem , (err) => {
                    if(err) {
                        console.log('[' + id + ']files/' + id + '/' + downloadItem + ' FILE SEND ERROR');
                    }
                    else {
                        console.log('[' + id + ']files/' + id + '/' + downloadItem + ' FILE SEND COMPLETE');
                    }
                });
            }
            else {
                //인가되지않은 타입의 경우
                res.end();
            }
        }
        else {
            res.end();
        }
    });

    //폴더 만들기
    app.post('/makeDirectory' , (req, res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.n_makeDirectory_path || '';
            var name = req.body.n_makeDirectory_Name || '';
            
            if(name != '')  {
                D_file.makeDirectory('./files/'+ id + path + '/' + name).then(
                    (returnValue) =>
                    {
                        console.log('[' + id + '] ./files/' + id + path + '/' + name + ' FOLDER MAKE COMPLETE');
                        res.redirect('/file' + '?path=' + path);
                    }
                );
            }
            else {
                res.end();
            }
        }
        else {
            res.redirect('/');
        }
    });

    //파일,폴더 지우기 처리
    app.post('/Delete' , (req ,res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var deletePath = req.body.n_deletePath;
            
            var deleteFileList = JSON.parse(req.body.n_deleteList);
            var deleteFileList_length = Object.keys(deleteFileList).length;

            for(var i = 0 ; i < deleteFileList_length; i++) {
                if(deleteFileList[i]['type'] == 'directory') {
                    D_file.moveTo('./files/' + id + deletePath + '/' + deleteFileList[i]['name'] , './files/trash_bin/'+deleteFileList[i]['name'] + '_' + id).then(
                        (returnValue) => 
                        {
                            console.log('[' + id + '] DIRECTORY DELETE COMPLETE');
                        }
                    );
                }
                else if(deleteFileList[i]['type'] == 'file') {
                    D_file.moveTo('./files/' + id + deletePath + '/' + deleteFileList[i]['name'] , './files/trash_bin/'+deleteFileList[i]['name'] + '_' + id).then(
                        (returnValue) => 
                        {
                            console.log('[' + id + '] FILE DELETE COMPLETE');
                        }
                    );
                }
            }
            res.redirect('/file' + '?path=' + deletePath);
        }
        else {
            res.redirect('/');
        }
    });

    //로그아웃 처리
    app.post('/logout' , (req , res) => {
        if(req.isAuthenticated()) {
            console.log('[' + req.user.id + '] LOGOUT COMPLETE')
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
                if(err) {
                    console.log('[' + ID + '] ADD USER ERROR');
                    res.redirect('/adduser?param=IDPW');
                }
                else {
                    D_file.makeDirectory('./files/'+ ID).then(
                        (returnValue) => 
                        {
                            console.log('[' + ID + '] ADD USER -> MAKE DEFAULT DIRECTORY COMPLETE');
                            res.redirect('/adduser?param=SUCCESS');
                        }
                    )
                }
            });
        }
    });

}