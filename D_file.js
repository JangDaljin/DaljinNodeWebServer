var fs = require('fs');


var D_file = {};


//리스트 가져오기
D_file.getList = (dirname , callback) => {
    fs.readdir(dirname , (err , files) => {
        if(err) {
            makeDirectory(dirname);
        }
        FILE_INFO = {};
        
        for(var i = 0 ; i < files.length; i++) {

            var stats = fs.lstatSync(dirname + '/' + files[i]) 
            
            var jsonstr = "{";
            jsonstr += '"type" :';

            if(stats.isFile()) {
                jsonstr += '"file"';
            } 
            if(stats.isDirectory()) {
                jsonstr += '"directory"';
            }

            jsonstr += ', "name": "';
            jsonstr += files[i];
            jsonstr += '"}';
            
            //console.dir(jsonstr);
            var obj = JSON.parse(jsonstr)
            FILE_INFO[i] = obj;
        }
        callback(FILE_INFO);
    })
}

//폴더 만들기
var makeDirectory = (dirname) => {
    fs.mkdirSync(dirname);
    console.log('Making file complete');
}

module.exports = D_file;