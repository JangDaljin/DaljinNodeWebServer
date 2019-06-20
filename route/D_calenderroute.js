var fs = require('fs');
var D_PATH = require('../D_setting').PATH;

module.exports = function(app) {
    var router = require('express').Router();

    router.get('/' , (req , res) =>  {
        res.render('calender.ejs');
    });

    //메모 저장
    router.post('/save' , (req , res) => {
        var output = {};
        output['result'] = false;

        if(req.isAuthenticated()) {
            var year = req.body.year || "";
            var month = req.body.month || "";
            var date = req.body.date || "";

            var saveData = {};
            saveData['title']   = req.body.title;
            saveData['content'] = req.body.content;

            var path = D_PATH['MEMO'] + '/' + req.user.email;

            //연도 폴더
            path += ('/' + year);
            if(fs.exists(path  , (result) => {
                if(!result) {
                    fs.mkdirSync(path);
                }

                //월 폴더
                path += ('/' + month)
                if(fs.exists(path  , (result) => {
                    if(!result) {
                        fs.mkdirSync(path);
                    }

                    //날짜 파일에 저장
                    var wstream = fs.createWriteStream(path + '/' + date);
                    wstream.write(JSON.stringify(saveData));
                    wstream.end();
                    output['result'] = true;
                    res.send(JSON.stringify(output));
                })); 
            }));
        }
        else {
            res.send(output);
        }

    });

    //메모 가져오기
    router.get('/getmemo' , (req , res) => {
        var output = {};
        output['result'] = false;
        if(!req.isAuthenticated()) {
            res.send(output);
            return;
        }

        var year = req.query.year || "";
        var month = req.query.month || "";
        var path = D_PATH['MEMO'] + '/' + req.user.email + '/' + year + '/' + month
        
        fs.readdir(path , (error , list) => {
            if(!error) {
                output['result'] = true;
                output['list'] = [];
                list.forEach( (val , index , arr) => {
                    var readData = JSON.parse(fs.readFileSync(path + '/' + val , 'utf8'));

                    var item = { 'title' : readData['title'] , 
                                'content' : readData['content'] ,
                                'year' : year,
                                'month' : month,
                                'date' : val }
                    output['list'].push(item);
                });
            }
            res.send(JSON.stringify(output));
        });
    });

    return router;
}