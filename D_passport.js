var passport = require('passport');
var NaverStrategy = require('passport-naver').Strategy;
var NaverTokenStrategy = require('passport-naver-token').Strategy;
var D_PATH = require('./D_setting').PATH
var OAUTH = require('./D_setting').OAUTH
var D_file = require('./D_file');
var request = require('request');

passport.use(new NaverStrategy({
    clientID : OAUTH.NAVER.CLIENT_ID
    ,
    clientSecret : OAUTH.NAVER.CLIENT_SECRET
    ,
    callbackURL : OAUTH.NAVER.CALLBACK
} , 
(accessToken, refreshToken, profile, done) => {
    var user_email = profile.emails[0].value;
    var user_nickname = profile.displayName;

    NaverLoginProcess(user_email , user_nickname , accessToken , done);
}));

passport.use(new NaverTokenStrategy({
    clientID : OAUTH.NAVER.CLIENT_ID
    ,
    clientSecret : OAUTH.NAVER.CLIENT_SECRET
    ,
    callbackURL : OAUTH.NAVER.CALLBACK
} , 
(accessToken, refreshToken, profile, done) => {
    var loginInfo = profile._json.response;
    var user_email = loginInfo['email']
    var user_nickname = loginInfo['nickname'];

    NaverLoginProcess(user_email , user_nickname , accessToken , done);
}));


var NaverLoginProcess = (user_email , user_nickname , accessToken , done) => {
//필수 항목 비동의
if(!user_email || !user_nickname) {
    var options = {
        uri : 'https://nid.naver.com/oauth2.0/token',
        qs : {
            grant_type : 'delete',
            client_id : OAUTH.NAVER.CLIENT_ID,
            client_secret : OAUTH.NAVER.CLIENT_SECRET,
            access_token : accessToken,
            service_provider : 'NAVER'
        }
    }
    
    request.get(options , function(err , response , body){
        console.log("[" + user_email + "/" + user_nickname + "] 필수항목 비동의");
    });
    return done(null , null);
}

var D_UserModel = require('./D_database').D_UserModel;

D_UserModel.findOne({'email':user_email} , (err,user) => {
    if(err) {
        console.log('[' + user_email + '] LOGIN ERROR');
        return done(err , null);
    }
    
    if(!user) {
        //최초가입
        console.log('[' + user_email + '] NOT FOUND ID')
        var UserModel = new D_UserModel(
            {
                email : user_email,
                nickname : user_nickname ,
                grade : 'anonymous',
                code : '',
                max_storage : 1024*1024*10
            }
        );
        //신규 저장
        UserModel.save((err)=> {
            if(err) {
                console.log('[' + user_email + '] ADD USER ERROR');
                return done(err , null);
            }
            else {
                D_file.makeDirectory(D_PATH["DOWNLOAD"]+ '/' + user_email).then(
                    (returnValue) => 
                    {
                        console.log('[' + user_email + '] ADD USER -> MAKE DEFAULT DIRECTORY COMPLETE');
                        return done(null , UserModel);
                    }
                )
            }
        });   
    }
    else {
        console.log('[' + user_email + '] LOGIN SUCCESS');
        return done(null , user);
    }
})};

passport.serializeUser(function(user, done) {
    done(null , user);
}); 

passport.deserializeUser((user , done) => {
    done(null , user);
});


module.exports = passport;
