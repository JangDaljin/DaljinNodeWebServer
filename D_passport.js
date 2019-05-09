var passport = require('passport');
var NaverStrategy = require('passport-naver').Strategy;
var D_PATH = require('./D_setting').PATH
var OAUTH = require('./D_setting').OAUTH
var D_file = require('./D_file');

passport.use(new NaverStrategy({
    clientID : OAUTH.NAVER.CLIENT_ID
    ,
    clientSecret : OAUTH.NAVER.CLIENT_SECRET
    ,
    callbackURL : OAUTH.NAVER.CALLBACK
} , 
function(accessToken, refreshToken, profile, done) {
    
    var user_email = profile.emails[0].value;
    var user_name = profile.displayName;

    var D_UserModel = require('./D_database').D_UserModel;

    D_UserModel.findOne({'email':user_email} , (err,user) => {
        if(err) {
            console.log('[' + user_email + '] LOGIN ERROR');
            done(err , null);
        }
        
        //최초가입
        if(!user) {
            console.log('[' + user_email + '] NOT FOUND ID')
            var UserModel = new D_UserModel(
                {
                    email : user_email,
                    nickname : user_name ,
                    grade : 'anonymous',
                    code : '0000',
                    max_storage : 1024*1024*1
                }
            );
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
                            done(null , UserModel);
                        }
                    )
                }
            });   
        }
        else {
            console.log('[' + user_email + '] LOGIN SUCCESS');
            done(null , user);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null , user);
}); 

passport.deserializeUser((user , done) => {
    done(null , user);
});


module.exports = passport;
