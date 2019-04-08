var SOCKET_SETTING = 
{
    'HOSTNAME' : 'localhost'
    ,
    'PORT' : '3000' 
};

var PATH = 
{
    'DOWNLOAD'  : '../users'
    ,
    'UPLOAD'    : '../uploads'
    ,
    'TRASH_BIN' : '../trash_bin'
};

PATH.INIT = function()  {
    var fs = require('fs');
    var res = false;
    try {
        fs.mkdirSync(PATH["DOWNLOAD"]);
        fs.mkdirSync(PATH["UPLOAD"]);
        fs.mkdirSync(PATH["TRASH_BIN"]);
        res = true;
    }
    catch (e) {
        res = false;
    }
    return res;
};


var DB_SETTING = 
{
    'DB_URL' : 'mongodb+srv://rw:ufwlds@daljin-mcs3v.gcp.mongodb.net/test?retryWrites=true'
};

var USER_SETTING = 
{
     0 : { 'grade' : 'master' , 'code' : '0105' , 'max_storage' : 1024*1024*1024*100}
    ,
     1 : { 'grade' : 'normal' , 'code' : '1994' , 'max_storage' : 1024*1024*100}
};


module.exports.SOCKET_SETTING   = SOCKET_SETTING;
module.exports.PATH             = PATH;
module.exports.USER_SETTING     = USER_SETTING;
module.exports.DB_SETTING       = DB_SETTING;