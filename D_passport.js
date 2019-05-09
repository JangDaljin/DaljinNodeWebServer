var passport = require('passport');
var LocalStrategy = require('passport-local');

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

passport.serializeUser(function(user, done) {
    done(null , user);
}); 

passport.deserializeUser((user , done) => {
    done(null , user);
});


module.exports = passport;
