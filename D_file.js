var fs = require('fs');
var D_file = {};

//리스트
D_file.getList = async (dirname) => {
    var arr_Filelist = [];
    var FILE_INFO = [];
    try {
        arr_Filelist = await fs.readdirSync(dirname);
    }
    catch (e) {
        console.log(dirname , 'WRONG NAME');
        return null;
    }
    for(var i = 0 ; i < arr_Filelist.length; i++) {
        FILE_INFO.push(await getStats_Async(dirname , arr_Filelist[i]));
    }

    //정렬
    FILE_INFO.sort((a , b) => {
        if(a.type == b.type) {
            if(a.name == b.name) return 0;
            return a.name > b.name? 1 : -1
        }
        else {
            if(a.type == 'directory' && b.type == 'file') {
                return -1;
            }
            else {
                return 1;
            }
        }
    })

    var NEW_FILE_INFO = {};
    for(i in FILE_INFO) {
        NEW_FILE_INFO[i] = FILE_INFO[i]
    }
    return NEW_FILE_INFO;
}

//파일정보 얻기
var getStats_Async = async (folderpath , filename) => {

    var filepath = folderpath + '/' + filename;

    var stats = await fs.lstatSync(filepath);

    var obj = {};
    var dot_index = filename.lastIndexOf('.');

    obj['size']        = (stats.isFile()) ? stats.size : getFolderSize(filepath);
    obj['ctime']       = makeDate(stats.ctime);
    obj['type']        = (stats.isFile()) ? 'file' : 'directory';
    obj['name']        = (dot_index != -1) ? filename.substring(0 , filename.lastIndexOf('.')) : filename;
    obj['extension']   = (dot_index != -1) ? filename.substring(filename.lastIndexOf('.') +1 , filename.length) : '';
    obj['fullname']    = obj['name'] + ((obj['extension'] =='')? '' : '.' + obj['extension']);
    return obj;
}

//파일 이동
D_file.moveTo = async (source , destination) => {
    var res = false;
    try {
        await fs.renameSync(source , destination);
        res = true;
    }
    catch(e) {
        res = false;
    }
    return res;
} 

//폴더만들기
D_file.makeDirectory = async (dirname) => {
    var res = false;
    try {
        await fs.mkdirSync(dirname);
        res = true;
    }
    catch(e) {
        res = false;
    }
    return res;
}

//현재 위치 기준으로 파일 사이즈 측정(재귀 함수 실행)
D_file.getTotalSizeOnRoot = (rootpath) => {
    return getFolderSize(rootpath);
}

//현재 위치 기준으로 파일 사이즈 측정(재귀 함수)
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

//파일 삭제
D_file.removeFile = (path) => {
    var res = false;
    try {
        fs.unlinkSync(path);
        res = true;
    }
    catch(e) {
        res = false;
    }
    return res;
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