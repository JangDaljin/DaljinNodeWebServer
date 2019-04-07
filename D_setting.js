var SOCKET_SETTING = 
{
    'HOSTNAME' : 'localhost'
    ,
    'PORT' : '10000' 
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
module.exports.USER_SETTING     = USER_SETTING;
module.exports.DB_SETTING       = DB_SETTING;