var passport = require('./D_passport');
var D_file = require('./D_file');
var D_Mongoose = require('./D_database').D_Mongoose;
var D_PATH = require('./D_setting').PATH;

var path = require('path');
var multer = require('multer');
var archiver = require('archiver');

module.exports = function(app) {

    //========================================================================================================================================//
    //메인 페이지
    app.get('/' , (req , res) => {
        var msg = req.query.msg || '';
        
        if(req.isAuthenticated()) {
            res.redirect('/file');
        }
        else {
            res.render('login.ejs' , {'msg' : msg});
        }
    });

    // WEB로그인
    app.post('/login' , passport.authenticate('login', {
        successRedirect : '/file',
        failureRedirect : '/?msg=로그인실패'
    }));
    
    // WEB이외 로그인
    app.post('/loginNW' , (req , res) => {
        var output = {};
        output['error'] = true;

        if(req.isAuthenticated()) {
            output['error'] = false;
            output['id'] = req.user.id;
            output['grade'] = req.user.grade;
            output['max_storage'] = req.user.max_storage;
            res.send(JSON.stringify(output));
            return;
        }
        
        passport.authenticate('login' , (err , user) => {
            if(err || !user) {
                res.send(JSON.stringify(output));
                return;
            }
            req.logIn(user , (err) => {
                if(err) {
                    res.send(JSON.stringify(output));
                    return;
                }
                output['error'] = false;
                output['id'] = user.id;
                output['grade'] = user.grade;
                output['max_storage'] = user.max_storage;
                res.send(JSON.stringify(output));
                return;
            });
        })(req ,res);
    });


        


    //========================================================================================================================================//




    //========================================================================================================================================//
    //유저추가 페이지
    app.get('/adduser' , (req , res) => {
        var param = req.query.param || '';
        var redirect = req.query.redirect || '';
        res.render('adduser.ejs' , {'param' : param , 'redirect' : redirect});
    });

    //아이디 중복체크(AJAX 전용)
    app.post('/checkid' , (req , res) => {
        var ID = req.body.ID;

        var output_json = {};
        output_json['result'] = false;

        D_Mongoose.user_ID_Check(ID).then(
            (returnValue) => 
            {
                if(returnValue == true) {
                    output_json['result'] = true;
                }
                else {
                    output_json['result'] = false;
                }
                res.send(JSON.stringify(output_json));
            }
        );
    });

    //유저추가 처리
    app.post('/adduser' , (req , res)=> {
        var ID = req.body.ID || req.query.ID;
        var PW = req.body.PW || req.query.PW;
        var CODE = req.body.CODE || req.query.CODE;
        
        if(ID.trim() == '' && PW.trim() == '' && CODE.trim() == '') {
            res.redirect('/adduser?redirect=0&param=' + '형식이 잘못됐습니다.');
            return;
        }


        var USER_SETTING = req.app.get('USER_SETTING');
        var cur_USER_SETTING = null;
        for(var i = 0 ; i < Object.keys(USER_SETTING).length; i++) {
            if(USER_SETTING[i]['code'] == CODE) {
                cur_USER_SETTING = USER_SETTING[i];
                break;
            }
        }
        if(cur_USER_SETTING == null) {
            res.redirect('/adduser?redirect=0&param=' + '승인코드가 틀렸습니다');
        }
        else {
            D_Mongoose.user_ID_Check(ID).then(
                (returnValue) => {
                    if(!returnValue) {
                        res.redirect('/adduser?redirect=0&param=' + '이미 해당 아이디가 존재합니다.');
                    }
                    else if(D_Mongoose.user_PW_Check(PW)) {
                        res.redirect('/adduser?redirect=0&param=' + '비밀번호가 형식에 맞지 않습니다');
                    }
                    else {
                        var D_UserModel = req.app.get('D_UserModel');
                        var UserModel = new D_UserModel(
                            {
                                id : ID,
                                password : PW,
                                grade : cur_USER_SETTING['grade'],
                                max_storage : cur_USER_SETTING['max_storage']
                            }
                        );

                        UserModel.save((err)=> {
                            if(err) {
                                console.log('[' + ID + '] ADD USER ERROR');
                                res.redirect('/adduser?redirect=0&param=' + '등록에 실패했습니다.');
                            }
                            else {
                                D_file.makeDirectory(D_PATH["DOWNLOAD"]+ '/' + ID).then(
                                    (returnValue) => 
                                    {
                                        console.log('[' + ID + '] ADD USER -> MAKE DEFAULT DIRECTORY COMPLETE');
                                        res.redirect('/adduser?redirect=1&param=' + '정상적으로 등록되었습니다.');
                                    }
                                )
                            }
                        });
                    }
                }
            );
        }
    });

    //유저추가 처리(WEB 이외)
    app.post('/adduserNW' , (req , res)=> {
        var ID = req.body.ID || req.query.ID;
        var PW = req.body.PW || req.query.PW;
        var CODE = req.body.CODE || req.query.CODE;
        
        var output = {};
        output['error'] = true;
        output['msg'] = "";
        

        if(ID.trim() == '' && PW.trim() == '' && CODE.trim() == '') {
            output['msg'] = '입력데이터 비정상'
            res.send(JSON.stringify(output));
            return;
        }


        var USER_SETTING = req.app.get('USER_SETTING');
        var cur_USER_SETTING = null;
        for(var i = 0 ; i < Object.keys(USER_SETTING).length; i++) {
            if(USER_SETTING[i]['code'] == CODE) {
                cur_USER_SETTING = USER_SETTING[i];
                break;
            }
        }
        if(cur_USER_SETTING == null) {
            output['msg'] = '승인코드 에러';
            res.send(JSON.stringify(output));
        }
        else {
            D_Mongoose.user_ID_Check(ID).then(
                (returnValue) => {
                    if(!returnValue) {
                        output['msg'] = '해당 아이디가 존재합니다';
                        res.send(JSON.stringify(output));
                    }
                    else if(D_Mongoose.user_PW_Check(PW)) {
                        output['msg'] = '비밀번호가 형식에 맞지 않습니다';
                        res.send(JSON.stringify(output));
                    }
                    else {
                        var D_UserModel = req.app.get('D_UserModel');
                        var UserModel = new D_UserModel(
                            {
                                id : ID,
                                password : PW,
                                grade : cur_USER_SETTING['grade'],
                                max_storage : cur_USER_SETTING['max_storage']
                            }
                        );

                        UserModel.save((err)=> {
                            if(err) {
                                console.log('[' + ID + '] ADD USER ERROR');
                                output['msg'] = '등록에 실패했습니다.';
                        res.send(JSON.stringify(output));
                            }
                            else {
                                D_file.makeDirectory(D_PATH["DOWNLOAD"]+ '/' + ID).then(
                                    (returnValue) => 
                                    {
                                        console.log('[' + ID + '] ADD USER -> MAKE DEFAULT DIRECTORY COMPLETE');
                                        output['error'] = false;
                                        output['msg'] = '정상적으로 등록되었습니다';
                                        res.send(JSON.stringify(output));
                                    }
                                )
                            }
                        });
                    }
                }
            );
        }
    });
    //========================================================================================================================================//



    //========================================================================================================================================//
    //파일 리스트 요청(WEB 이외)
    app.post('/fileList'  ,(req , res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.path || '';

            D_file.getList(D_PATH["DOWNLOAD"] + '/' + id + path).then(
                (returnValue) => 
                {
                    var output = {};
                    output['error'] = returnValue == null ? true : false;
                    output['files'] = returnValue;
                    output['used_storage'] = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + id);
                    res.send(JSON.stringify(output));
                }
            );
        }
        else {
            var output = {};
            output['error'] = true;
            res.send(JSON.stringify(output));
        }
    });

    //파일 페이지
    app.get('/file'  ,  (req , res)=> {
        if(req.isAuthenticated()) {
            var id = req.user.id;``
            var grade = req.user.grade;
            var max_storage = req.user.max_storage;
            
            
            var path = decodeURIComponent(req.query.path);
            if(path == "undefined") {
                path = '';
            }
            var msg = req.query.msg || '';

            D_file.getList(D_PATH["DOWNLOAD"] + '/' + id + path).then(
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
                        obj['used_storage'] = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + id);
                        obj['grade'] = grade;
                        res.render('file.ejs' , {data : JSON.stringify(obj) , 'msg' : msg});
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
                callback(null , D_PATH["UPLOAD"]);
            },
            filename : (req , file , callback) => {
                callback(null , decodeURIComponent(file.originalname) + '_' + req.user.id);
            }
        })
    });

    
    //파일 업로드 요청
    app.post('/fileUpload' , (req , res)=> {
        if(req.isAuthenticated()) {

            var path = '';
            var form = new(require('formidable')).IncomingForm();
            form.parse(req , (err , fields , files) => {
                path = fields['n_upload_path'];
            });

            var id = req.user.id;
            var max_storage = req.user.max_storage;
            var used_storage = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + id);
            
            
            var msg = "";
            var files = null;

            //progress stream을 거쳐 현재 퍼센트 제공
            var input_file = upload.array('n_upload_files');
            var progress = require('progress-stream')({
                length:'0'
            });
            progress.user = req.user;

            req.pipe(progress);
            progress.headers = req.headers;
            progress.on('progress' , (obj) => { 
                if(obj.remaining == 0) {
                    //res.end();
                }
            });

            //재귀함수로 파일 업로드
            var loopFunciton = (i) => {
                if(files.length <= i) return true; 

                var res = true;
                
                if(used_storage + files[i].size <= max_storage) {
                    D_file.moveTo(D_PATH["UPLOAD"] + '/' + files[i].filename  , D_PATH["DOWNLOAD"] + '/' + id + path + '/' + decodeURIComponent(files[i].originalname)).then(
                        (returnValue) => 
                        {
                            console.log('[' + id + ']' + decodeURIComponent(files[i].originalname) + ' UPLOAD COMPLETE');
                            res = loopFunciton(i+1) && res;
                        }
                    );
                }
                else {
                    if(D_file.removeFile(D_PATH["UPLOAD"] + '/' + files[i].filename) == false) {
                        D_file.moveTo(D_PATH["UPLOAD"] + '/' + files[i].filename , D_PATH['TRASH_BIN'] + '/' + files[i].filename);
                        console.log(files[i].filename + " CAN'T REMOVE THEN MOVED TRASH BIN");
                    }
                    console.log('[' + id + '] UPLOAD FAIL(FULL OVER STORAGE)');
                    msg += "용량초과[" + decodeURIComponent(files[i].originalname) + "]\n";
                    res = false;
                    res = loopFunciton(i+1) && res;
                }
                return res;
            }

            //업로드 시작
            input_file(progress , res , (err) => {
                files = progress.files;
                if(err) {
                    console.log('[' + id + '] UPLOAD ERROR');
                }
                else {    
                    if(loopFunciton(0)) {
                        msg = "업로드가 정상적으로 완료되었습니다.";
                    }
                    
                    res.end(msg);
                }
            });
        }
        else {
            res.redirect('/');
        }
    });


    //파일다운로드시 헤더에 한글명 사용가능
    function getDownloadFilename(req, filename) {
        var header = req.headers['user-agent'];
        if (header.includes("MSIE") || header.includes("Trident") || header.includes("Edge"))  { 
            return encodeURIComponent(filename).replace(/\\+/gi, "%20");
        } else {
            return encodeURIComponent(filename);
        }
    }


    //파일다운로드 처리
    app.post('/Download/' , (req , res) => {
        if(req.isAuthenticated()) {

            var id =  req.user.id;
            var path            = req.body.n_itemPath         || '';
            var downloadItem    = req.body.n_downloadItem     || '';
            var type            = req.body.n_itemType         || ''; 

            //jQuery.fileDownload.js 사용을 위한 쿠키설정
            res.setHeader("Set-Cookie", "fileDownload=true; path=/");

            //폴더일 경우 ZIP 변경
            if(type == 'directory') {
                res.setHeader('Content-Type' , 'application/zip');
                res.setHeader('Content-Disposition', 'attachment; filename=' + getDownloadFilename(req, downloadItem.substring(0,downloadItem.length)+'.zip'));

                var archive = archiver('zip');
                new Promise(
                    () => {
                    archive
                    .directory(D_PATH["DOWNLOAD"] + '/' +  id + path + '/'  + downloadItem, false)
                    .on('error', (err) => {
                        archive.close()
                        console.log('[' + id + ']' + id + path + '/' + downloadItem + ' FOLDER(ZIP) SEND ERROR');
                    })
                    .pipe(res);
                
                    res.on('finish', 
                    () => {
                        console.log('[' + id + ']' + id + path + '/' + downloadItem + ' FOLDER(ZIP) SEND COMPLETE');
                    });
                    archive.finalize();
                });
            }
            else if(type == 'file'){
                
                res.download(D_PATH["DOWNLOAD"] + '/' +  id + path + '/' + downloadItem , downloadItem , (err) => {
                    if(err) {
                        console.log('[' + id + ']' + id + path + '/' + downloadItem + ' FILE SEND ERROR');
                    }
                    else {
                        console.log('[' + id + ']' + id + path + '/' + downloadItem + ' FILE SEND COMPLETE');
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
                D_file.makeDirectory(D_PATH["DOWNLOAD"] + '/' + id + path + '/' + name).then(
                    (returnValue) =>
                    {
                        console.log('[' + id + ']' + id + path + '/' + name + ' FOLDER MAKE COMPLETE');
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

    //폴더 만들기
    app.post('/makeDirectoryNW' , (req, res)=> {
        
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var path = req.body.n_makeDirectory_path || '';
            var name = req.body.n_makeDirectory_Name || '';
            output = {};
            output['error'] = true

            if(name != '')  {
                D_file.makeDirectory(D_PATH["DOWNLOAD"] + '/' + id + path + '/' + name).then(
                    (returnValue) =>
                    {
                        console.log('[' + id + ']' + id + path + '/' + name + ' FOLDER MAKE COMPLETE');
                        output['error'] = false
                        res.send(JSON.stringify(output));
                    }
                );
            }
            else {
                res.send(JSON.stringify(output));
            }
        }
        else {
            res.end();
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
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + id + deletePath + '/' + deleteFileList[i]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[i]['name'] + '_' + id)
                        .then(
                        (returnValue) => 
                        {
                            console.log('[' + id + '] DIRECTORY DELETE COMPLETE');
                        }
                    );
                }
                else if(deleteFileList[i]['type'] == 'file') {
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + id + deletePath + '/' + deleteFileList[i]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[i]['name'] + '_' + id)
                    .then(
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

    app.post('/DeleteNW' , (req ,res) => {
        if(req.isAuthenticated()) {
            var id = req.user.id;
            var deletePath = req.body.n_deletePath;
            var deleteFileList = JSON.parse(req.body.n_deleteList);
            var deleteFileList_length = Object.keys(deleteFileList).length;

            for(var i = 0 ; i < deleteFileList_length; i++) {
                if(deleteFileList[i]['type'] == 'directory') {
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + id + deletePath + '/' + deleteFileList[i]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[i]['name'] + '_' + id)
                        .then(
                        (returnValue) => 
                        {
                            console.log('[' + id + '] DIRECTORY DELETE COMPLETE');
                        }
                    );
                }
                else if(deleteFileList[i]['type'] == 'file') {
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + id + deletePath + '/' + deleteFileList[i]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[i]['name'] + '_' + id)
                    .then(
                        (returnValue) => 
                        {
                            console.log('[' + id + '] FILE DELETE COMPLETE');
                        }
                    );
                }
            }
            res.send("")
        }
        else {
            res.end()
        }
    });
    //========================================================================================================================================//






    //========================================================================================================================================//
    //유저관리 페이지
    app.get('/master' , (req , res) => {
        if(req.isAuthenticated() && req.user.grade == 'master') {
            D_Mongoose.getAllUserData().then(
                (returnValue) => {
                    res.render('master.ejs' , {data : JSON.stringify(returnValue) , usersetting : req.app.get('USER_SETTING')});
                }
            )
        }
        else {
            res.redirect('/');
        }
    })

    //유저관리 페이지 (AJAX 유저 삭제))
    app.post('/userUpdate' , (req , res) => {
        if(req.isAuthenticated() && req.user.grade == 'master') {
            var INPUT_DATA = req.body;
            var id = INPUT_DATA['id'];
            var grade = INPUT_DATA['grade'];
            var storage = INPUT_DATA['storage'];
            var OUTPUT_DATA = {};
            D_Mongoose.userUpdate(id , grade , storage).then(
                (returnValue) => 
                {
                    if(returnValue == true) {
                        OUTPUT_DATA['result'] = true;
                    }
                    else {
                        OUTPUT_DATA['result'] = false;
                    }
                    res.send(JSON.stringify(OUTPUT_DATA));
                }
            );
        }
        else {
            res.send({});
        }
    });

    //유저관리 페이지 (AJAX 유저 정보 변경)
    app.post('/userDelete' , (req ,res) => {
        if(req.isAuthenticated() && req.user.grade == 'master') {
            var INPUT_DATA = req.body;
            var id = INPUT_DATA['id'];
            var OUTPUT_DATA = {};
            D_Mongoose.userDelete(id).then(
                (returnValue) => 
                {
                    if(returnValue == true) {
                        OUTPUT_DATA['result'] = true;
                    }
                    else {
                        OUTPUT_DATA['result'] = false;
                    }
                    res.send(JSON.stringify(OUTPUT_DATA));
                }
            )
        }
        else {
            res.send({})
        }

    });
    //========================================================================================================================================//




    //========================================================================================================================================//

    app.post('/logoutNW' , (req , res) => {
        var output  = {};
        output['error'] = true;
        if(req.isAuthenticated()) {
            output['error'] = false
            req.logout();
        }
        res.send(JSON.stringify(output));
    });

    //로그아웃 처리
    app.post('/logout' , (req , res) => {
        if(req.isAuthenticated()) {
            console.log('[' + req.user.id + '] LOGOUT COMPLETE')
            req.logout();
        }
        res.redirect('/');
    });
    //========================================================================================================================================//





    //========================================================================================================================================//
    app.get('/logoHorizonImage' , (req ,res) => {
        require('fs').readFile('./views/daljin_logo_horizon.png' , (error , data) => {
            res.writeHead(200 , {'Content-Type' : 'text/html'});
            res.end(data)
        })
    })



    //========================================================================================================================================//
}