var fs = require('fs');


var D_file = {};


//리스트 가져오기
D_file.getList = (dirname , callback) => {
    fs.readdir(dirname , (err , files) => {
        if(err) {
            callback(err , null);
        }
        else {
            FILE_INFO = {};
            for(var i = 0 ; i < files.length; i++) {
                console.log(files[i]);
                var stats = fs.lstatSync(dirname + '/' + files[i]) 

                var dot_index = files[i].lastIndexOf('.');
                var obj = {};
                obj['type']        = (stats.isFile()) ? 'file' : 'directory';
                obj['name']        = (dot_index != -1) ? files[i].substring(0 , files[i].lastIndexOf('.')) : files[i];
                obj['extension']   = (dot_index != -1) ? files[i].substring(files[i].lastIndexOf('.')+1 , files[i].length) : '';

                FILE_INFO[i] = obj;
            }
            callback(null ,FILE_INFO);
        }
    })
}

//폴더 만들기
var makeDirectory = (dirname) => {
    fs.mkdirSync(dirname);
    console.log('Making file complete');
}

module.exports = D_file;