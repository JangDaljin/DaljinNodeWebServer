var fs = require('fs');
var path = require('path');
var D_file = {};

//리스트
D_file.getList = (dirname , callback) => {

    dirname = path.join(__dirname , dirname);

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
                obj['size']        = (stats.isFile()) ? stats.size : getFolderSize(dirname + '/' + files[i]);
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

//파일 이동
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

//폴더만들기
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

D_file.getTotalSizeOnRoot = (rootpath) => {
    return getFolderSize(rootpath)
}

var getFolderSize = (path) => {
    var size = 0; 
    var strArr_filelist = fs.readdirSync(path);
    for(var i = 0; i < strArr_filelist.length; i++) {
        var stats = fs.lstatSync(path + '/' + strArr_filelist[i]);
        if(stats.isFile()) {
            size += stats.size
        }
        else {
            size += getFolderSize(path + '/' + strArr_filelist[i]);
        }
    }
    return size;
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