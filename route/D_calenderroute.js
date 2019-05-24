var fs = require('fs');
var D_PATH = require('../D_setting').PATH;

module.exports = function(app) {
    var router = require('express').Router();

    router.get('/' , (req , res) =>  {

        res.render('calender.ejs');


    });

    router.post('/save' , (req , res) => {
        var date = req.body.date || ""; // yyyy-m-d
        var sp_date = date.split('-');

        var saveData = {};
        saveData['title']   = req.body.title;
        saveData['content'] = req.body.content;

        var path = D_PATH['MEMO'] + '/' + req.user.email;

        var loop = (sp , cnt=0) => {
            if(cnt == 2) { 
                var wstream = fs.createWriteStream(D_PATH['MEMO'] + '/' + req.user.email + '/' + date + '.txt');
                wstream.write(JSON.stringify(saveData));
                wstream.end();
                res.send("{'result' : 'true'}");
            }
            else {
                if(fs.exists(path + '/' + sp_date[cnt]) , (result) => {
                    if(!result) {
                        fs.mkdir(path + '/' + sp_date[cnt]);
                    }
                    path += sp_date[cnt++];
                    loop(sp , cnt);
                });
            }
        }
        loop();
    });

    router.get('/getmemo' , (req , res) => {
        var date = req.body.date || "";
        var sp_date = date.split('-');

        var output = {};
        output['result'] = false;

        fs.readdir(D_PATH['MEMO'] + '/' + req.user.email + '/' + sp_date[0] + '/' + sp_date[1] , (error , list) => {
            if(!error) {
                output['result'] = true;
                output['list'] = {};
                list.forEach( (val , index , arr) => {
                    output['list'][index] = val;
                });
            }
            res.send(JSON.stringify(output));
        });
    });


    return router;
}