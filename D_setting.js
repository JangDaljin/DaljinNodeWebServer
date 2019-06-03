var SOCKET_SETTING = 
{
    'HOSTNAME' : '192.168.1.200'
    ,
    'PORT' : '80'
};

var PATH = 
{
    'DOWNLOAD'  : '../users'
    ,
    'UPLOAD'    : '../uploads'
    ,
    'TRASH_BIN' : '../trash_bin'
    ,
    'MEMO' : '../calender'
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
        'CALLBACK' : 'http://daljin.dlinkddns.com/navercallback'
    }

    ,

    'GOOGLE' :
    {
        
        'CLIENT_ID' : '854819661421-b6ipmcvabufu3b99q6guj35pj56m323u.apps.googleusercontent.com'
        ,
        'CLIENT_SECRET' : 'E2uYmIU5USo8x_M9BwAhN3jz'
        ,
        'CALLBACK' : 'http://daljin.dlinkddns.com/googlecallback'
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