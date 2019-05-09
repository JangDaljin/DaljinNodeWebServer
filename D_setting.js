var SOCKET_SETTING = 
{
    'HOSTNAME' : 'localhost'
    ,
    'PORT' : '8000'
};

var PATH = 
{
    'DOWNLOAD'  : '../users'
    ,
    'UPLOAD'    : '../uploads'
    ,
    'TRASH_BIN' : '../trash_bin'
};

var DB_SETTING = 
{
    'DB_URL' : 'mongodb+srv://rw:ufwlds@daljin-mcs3v.gcp.mongodb.net/nodeweb?retryWrites=true'
};

var OAUTH = {
    'NAVER' :
    {
        'CLIENT_ID' : '1YgY8mfRkWeMrJJijjWA'
        ,
        'CLIENT_SECRET' : 'vdwkDUS14Q'
        ,
        'CALLBACK' : 'http://127.0.0.1:8000/navercallback'
    }
}

var USER_SETTING = 
{
     0 : { 'grade' : 'master' , 'code' : '0105' , 'max_storage' : 1024*1024*1024*100}
    ,
     1 : { 'grade' : 'normal' , 'code' : '1994' , 'max_storage' : 1024*1024*100}
     ,
     2 : { 'grade' : 'anonymous' , 'code' : '0000'  , 'max_storage' : 1024*1024*1}
};

module.exports.OAUTH            = OAUTH
module.exports.SOCKET_SETTING   = SOCKET_SETTING;
module.exports.PATH             = PATH;
module.exports.USER_SETTING     = USER_SETTING;
module.exports.DB_SETTING       = DB_SETTING;