var passport = require('./D_passport');
var D_file = require('./D_file');
var D_Mongoose = require('./D_database').D_Mongoose;
var D_PATH = require('./D_setting').PATH;
var multer = require('multer');
var archiver = require('archiver');

module.exports = function(app) {

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
        successRedirect : '/' , failureRedirect : '/'
    }));
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
    //파일 리스트 요청(WEB 이외)
    app.post('/filelist'  ,(req , res) => {
        if(req.isAuthenticated()) {
            var email = req.user.email;
            var path = req.body.path || '';

            D_file.getList(D_PATH["DOWNLOAD"] + '/' + email + path).then(
                (returnValue) => 
                {
                    var output = {};
                    output['error'] = returnValue == null ? true : false;
                    output['files'] = returnValue;
                    output['used_storage'] = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + email);
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

    //파일 프레임 페이지
    app.get('/fileframe' , (req , res) => {
        if(req.isAuthenticated) {
            var email = req.user.email;
            // var email = 'toyyj15@naver.com';
            var path = decodeURIComponent(req.query.path);
            if(path == "undefined") {
                path = '';
            }
            var listtype = req.query.listtype || '';

            D_file.getList(D_PATH["DOWNLOAD"] + '/' + email + path).then(
                (returnValue) => 
                {   
                    if(returnValue != null) {
                        var output = {};
                        output['data'] = JSON.stringify(returnValue);
                        output['path'] = path;
                        output['used_storage'] = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + email);
                        output['listtype'] = listtype;
                        res.render('fileframe.ejs' , output);
                    }
                }
            );
        }
    });

    //파일 페이지
    app.get('/cloud'  ,  (req , res)=> {
        if(req.isAuthenticated()) {

            var email = req.user.email;
            var nickname = req.user.nickname;
            var code = req.user.code;
            var grade = req.user.grade;
            var max_storage = req.user.max_storage;

            // var email = 'toyyj15@naver.com';
            // var nickname = 'daljin';
            // var code = '1111';
            // var grade = 'normal';
            // var max_storage = 1024*1024*1024*100;
            
            if(code == "0000" || grade == "anonymous" || max_storage == 0) {
                res.render('code.ejs');
            }
            else {
                output = {};
                output['email'] = email;
                output['nickname'] = nickname;
                output['max_storage'] = max_storage;
                output['used_storage'] = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + email);
                output['grade'] = grade;
                res.render('cloud.ejs' , output);
            }
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
                callback(null , decodeURIComponent(file.originalname) + '_' + req.user.email);
            }
        })
    });

    
    //파일 업로드 요청
    app.post('/upload' , (req , res)=> {
        if(req.isAuthenticated()) {

            var path = '';
            var form = new(require('formidable')).IncomingForm();
            form.parse(req , (err , fields , files) => {
                console.log("path : " + fields['n_upload_path']);
                path = fields['n_upload_path'];
            });
            console.dir(form);
            var email = req.user.email;
            var max_storage = req.user.max_storage;
            var used_storage = D_file.getTotalSizeOnRoot(D_PATH["DOWNLOAD"] + '/' + email);
            
            
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
                    D_file.moveTo(D_PATH["UPLOAD"] + '/' + files[i].filename  , D_PATH["DOWNLOAD"] + '/' + email + path + '/' + decodeURIComponent(files[i].originalname)).then(
                        (returnValue) => 
                        {
                            console.log('[' + email + ']' + decodeURIComponent(files[i].originalname) + ' UPLOAD COMPLETE');
                            res = loopFunciton(i+1) && res;
                        }
                    );
                }
                else {
                    if(D_file.removeFile(D_PATH["UPLOAD"] + '/' + files[i].filename) == false) {
                        D_file.moveTo(D_PATH["UPLOAD"] + '/' + files[i].filename , D_PATH['TRASH_BIN'] + '/' + files[i].filename);
                        console.log(files[i].filename + " CAN'T REMOVE THEN MOVED TRASH BIN");
                    }
                    console.log('[' + email + '] UPLOAD FAIL(FULL OVER STORAGE)');
                    msg += "용량초과[" + decodeURIComponent(files[i].originalname) + "]\n";
                    res = false;
                    res = loopFunciton(i+1) && res;
                }
                return res;
            }

            //업로드 시작
            input_file(progress , res , (err) => {
                var output = {};
                output["error"] = true;
                output["msg"] = "";
                files = progress.files;
                if(err) {
                    console.log('[' + email + '] UPLOAD ERROR');
                }
                else {    
                    if(loopFunciton(0)) {
                        output["error"] = false;
                        msg = "업로드가 정상적으로 완료되었습니다.";
                    }
                    else {
                        output["error"] = true;
                        msg = msg.substring(0 , msg.length-1);
                    }
                    output["msg"] = msg;
                    res.send(JSON.stringify(output));
                }
            });
        }
        else {
            res.end();
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
    app.post('/download/' , (req , res) => {
        if(req.isAuthenticated()) {

            var email =  req.user.email;
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
                    .directory(D_PATH["DOWNLOAD"] + '/' +  email + path + '/'  + downloadItem, false)
                    .on('error', (err) => {
                        archive.close()
                        console.log('[' + email + ']' + email + path + '/' + downloadItem + ' FOLDER(ZIP) SEND ERROR');
                    })
                    .pipe(res);
                
                    res.on('finish', 
                    () => {
                        console.log('[' + email + ']' + email + path + '/' + downloadItem + ' FOLDER(ZIP) SEND COMPLETE');
                    });
                    archive.finalize();
                });
            }
            else if(type == 'file'){
                
                res.download(D_PATH["DOWNLOAD"] + '/' +  email + path + '/' + downloadItem , downloadItem , (err) => {
                    if(err) {
                        console.log('[' + email + ']' + email + path + '/' + downloadItem + ' FILE SEND ERROR');
                    }
                    else {
                        console.log('[' + email + ']' + email + path + '/' + downloadItem + ' FILE SEND COMPLETE');
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
    app.post('/mkdir' , (req, res)=> {
        
        if(req.isAuthenticated()) {
            var email = req.user.email;
            var path = req.body.mkdirPath || '';
            var name = req.body.mkdirName || '';
            output = {};
            output['error'] = true
            output['msg'] = ""

            if(name != '')  {
                D_file.makeDirectory(D_PATH["DOWNLOAD"] + '/' + email + path + '/' + name).then(
                    (returnValue) =>
                    {
                        if(returnValue) {
                            console.log('[' + email + ']' + email + path + '/' + name + ' FOLDER MAKE COMPLETE');
                            output['error'] = false;
                            output['msg'] = "폴더 생성 완료";
                        }
                        else {
                            console.log('[' + email + ']' + email + path + '/' + name + ' FOLDER MAKE ERROR');
                            output['msg'] = "같은 파일의 이름이 존재합니다.";
                        }
                        res.send(JSON.stringify(output));
                    }
                );
            }
            else {
                console.log('[' + email + ']' + email + path + '/' + name + ' FOLDER MAKE ERROR(WHITE SPACE)');
                output['msg'] = "폴더 생성 실패";
                res.send(JSON.stringify(output));
            }
        }
        else {
            res.end();
        }
    });



    app.post('/delete' , (req ,res) => {
        if(req.isAuthenticated()) {
            var email = req.user.email;
            var deletePath = req.body.daletePath || "";
            var deleteFileList = JSON.parse(req.body.deleteList);
            var deleteFileList_length = Object.keys(deleteFileList).length;


            var output = {};

            var deleteLoop = (cnt = 0) => {
                if(cnt >= deleteFileList_length) {
                    res.send(JSON.stringify(output));
                    return;
                }

                if(deleteFileList[cnt]['type'] == 'directory') {
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + email + deletePath + '/' + deleteFileList[cnt]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[cnt]['name'] + '_' + email)
                        .then(
                        (returnValue) => 
                        {
                            if(returnValue) {
                                console.log('[' + email + '] DIRECTORY DELETE COMPLETE');
                                output[cnt] = { "error" : false , "msg" : deleteFileList[cnt] + " Delete Complete"};
                            }
                            else {
                                console.log('[' + email + '] DIRECTORY DELETE COMPLETE');
                                output[cnt] = { "error" : true , "msg" : deleteFileList[cnt] + " Delete Error"};
                            }
                            deleteLoop(cnt+1)
                        }
                    );
                }
                else if(deleteFileList[cnt]['type'] == 'file') {
                    D_file.moveTo(D_PATH["DOWNLOAD"] + '/' + email + deletePath + '/' + deleteFileList[cnt]['name'] ,
                                  D_PATH["TRASH_BIN"] + '/'+deleteFileList[cnt]['name'] + '_' + email)
                    .then(
                        (returnValue) => 
                        {
                            if(returnValue) {
                                console.log('[' + email + '] FILE DELETE COMPLETE');
                                output[cnt] = { "error" : false , "msg" : deleteFileList[cnt] + " Delete Complete"};
                            }
                            else {
                                console.log('[' + email + '] FILE DELETE COMPLETE');
                                output[cnt] = { "error" : true , "msg" : deleteFileList[cnt] + " Delete Error"};
                            }
                            deleteLoop(cnt+1)
                        }
                    );
                }
            };
            deleteLoop();
        }
        else {
            res.end();
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

    //유저 정보 변경
    app.post('/userUpdate' , (req , res) => {
        if(req.isAuthenticated() && req.user.grade == 'master') {
            var INPUT_DATA = req.body;
            var email = INPUT_DATA['email'];
            var grade = INPUT_DATA['grade'];
            var storage = INPUT_DATA['storage'];
            var OUTPUT_DATA = {};
            D_Mongoose.userUpdate(email , grade , storage).then(
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

    //유저 정보 삭제
    app.post('/userDelete' , (req ,res) => {
        if(req.isAuthenticated() && req.user.grade == 'master') {
            var INPUT_DATA = req.body;
            var email = INPUT_DATA['email'];
            var OUTPUT_DATA = {};
            D_Mongoose.userDelete(email).then(
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

}
    //========================================================================================================================================//
