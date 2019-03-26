var passport = require('passport');
var LocalStrategy = require('passport-local');


passport.use('login' , new LocalStrategy({
    usernameField : 'ID',
    passwordField : 'PW',
    passReqToCallback : true
} , 
function(req , id , pw , done) {
    if(id == 'master' && pw == 'daljin') {
        var user = { 
                        'ID' : id ,
                        'PW' : pw
                    };
        return done(null , user);
    }        
    else {
        return done(null , false);
    }
}))

passport.serializeUser(function(user, done) {
    done(null , user.ID);
}); 

passport.deserializeUser((id , done) => {
    console.dir(id);
    done(null , id);
});

module.exports = passport;
