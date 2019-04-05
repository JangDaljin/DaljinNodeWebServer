var fs = require('fs');
var path = require('path');
var D_file = {};

//리스트 가져오기
D_file.getList = (dirname , callback) => {

    dirname = path.join(__dirname , dirname);

    fs.readdir(dirname , (err , files) => {
        if(err) {
            console.log('errrr');
            callback(err , null);
        }
        else {
            FILE_INFO = {};
            for(var i = 0 ; i < files.length; i++) {
                var stats = fs.lstatSync(dirname + '/' + files[i]) 
                var dot_index = files[i].lastIndexOf('.');
                var obj = {};
                obj['size']        = getSize(stats.size , 0).toString();
                obj['ctime']       = makeDate(stats.ctime);
                obj['type']        = (stats.isFile()) ? 'file' : 'directory';
                obj['name']        = (dot_index != -1) ? files[i].substring(0 , files[i].lastIndexOf('.')) : files[i];
                obj['extension']   = (dot_index != -1) ? files[i].substring(files[i].lastIndexOf('.') +1 , files[i].length) : '';
                obj['fullname']    = obj['name'] + ((obj['extension'] =='')? '' : '.' + obj['extension']);

                FILE_INFO[i] = obj;
            }
            callback(null ,FILE_INFO);
        }
    })
}

D_file.moveTo = (source , destination, callback) => {

    fs.rename(source , destination , (err) => {
        if(err) {
            callback(err);
        }
        else {
            callback(null);
        }
    })
} 

//폴더 만들기
D_file.makeDirectory = (dirname , callback) => {
    fs.mkdir(dirname , (err) => {
        if(err) { 
            callback(err);
        }
        else {
            callback(null);
        }
    });
}

var getSize = (size , deter) => {
    if(size / 1024 > 1) {
        return getSize(size / 1024 , deter+1);
    }
    else {
        var res = '';
        switch(deter) {
            case 0 :
                res = 'B';
                break;
            case 1 :
                res = 'KB';
                break;
            case 2 :
                res = 'MB';
                break;
            case 3 : 
                res = 'GB';
                break;
            case 4:
                res = 'TB';
                break;
            default :
                res = "NaN";
                break;
        }
        return size.toFixed(2) + res;
    }
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