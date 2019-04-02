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
                var stats = fs.lstatSync(dirname + '/' + files[i]) 
                var dot_index = files[i].lastIndexOf('.');
                var obj = {};
                obj['size']        = stats.size.toString();
                obj['ctime']       = makeDate(stats.ctime);
                obj['type']        = (stats.isFile()) ? 'file' : 'directory';
                obj['name']        = (dot_index != -1) ? files[i].substring(0 , files[i].lastIndexOf('.')) : files[i];
                obj['extension']   = (dot_index != -1) ? files[i].substring(files[i].lastIndexOf('.')+1 , files[i].length) : '';

                FILE_INFO[i] = obj;
            }
            callback(null ,FILE_INFO);
        }
    })
}

D_file.moveTo = (source , destination) => {

    fs.rename(source , destination , (err) => {
        if(err) {
            console.log('ERROR : move ' + source + ' To ' + destination);
        }
        else {
            console.log("MOVE COMPLETE");
        }
    })
} 

//폴더 만들기
D_file.makeDirectory = (dirname , callback) => {
    fs.mkdir(dirname , (err) => {
        if(err) { callback(err) }
        else {
            callback(null);
        }
    });
}

//YYYY-MM-DD HHMMSS
var makeDate = (date) => {

    var ch = (n) => { return n < 10 ? '0'+n : ''+n}

    var year = date.getFullYear().toString();
    var month = ch(date.getMonth()+1);
    var day = ch(date.getDate());
    var hour = ch(date.getHours());
    var min = ch(date.getMinutes());
    var sec = ch(date.getSeconds());

    return year + '-' + month +'-' + day + ' ' + hour + ':' + min + ':' + sec;
}


module.exports = D_file;