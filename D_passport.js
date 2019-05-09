var passport = require('passport');
var LocalStrategy = require('passport-local');
var NaverStrategy = require('passport-naver');
var D_setting = require('./D_setting');

passport.use('login' , new LocalStrategy({
    usernameField : 'ID',
    passwordField : 'PW',
    passReqToCallback : true
} , 
function(req , id , pw , done) {
    

    var D_UserModel = req.app.get('D_UserModel');


    D_UserModel.findOne({'id':id} , (err,user) => {

        if(err) {
            console.log('[' + id + '] LOGIN ERROR');
            return done(err , null);
        }
        
        if(!user) {
            console.log('[' + id + '] NOT FOUND ID')
            return done(null , false);
        }

        var authenticated = user.authenticate(pw , user._doc.salt, user._doc.hashed_password);

        if(!authenticated) {
            console.log('[' + id + '] WRONG PASSWORD')
            return done(null , false);
        }

        console.log('[' + id + '] LOGIN SUCCESS');
        return done(null , user);
        
    });
    
}));


passport.use(new NaverStrategy({
    clientID : D_setting.OAUTH.NAVER.APP_ID
    ,
    clientSecret : D_setting.OAUTH.NAVER.APP_SECRET
    ,
    callbackURL : D_setting.OAUTH.NAVER.APP_CALLBACK
}, function(accessToken , refreshToken , profile ,done) {
    
    var email = profile.email;
    D_UserModel.findOne({'id':email} , (err,user) => {

        if(err) {
            console.log('[' + email + '] LOGIN ERROR');
            return done(err , null);
        }
        
        if(!user) {
            console.log('[' + email + '] NOT FOUND ID')
            var UserModel = new D_UserModel(
                {
                    id : email,
                    password : " ",
                    grade : D_setting.USER_SETTING[1],
                    max_storage : D_setting.USER_SETTING[1]
                }
            );

            UserModel.save((err)=> {
                if(err) {
                    console.log('[' + ID + '] ADD USER ERROR');
                    return done(err , null);
                }
                else {
                    D_file.makeDirectory(D_PATH["DOWNLOAD"]+ '/' + ID).then(
                        (returnValue) => 
                        {
                            console.log('[' + ID + '] ADD USER -> MAKE DEFAULT DIRECTORY COMPLETE');

                            D_UserModel.findOne({'id':email} , (err,newuser) => { 
                                return done(null , newuser);
                            })

                        }
                    )
                }
            });
        }
        else {
            console.log('[' + email + '] LOGIN SUCCESS');
            return done(null , user);
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
