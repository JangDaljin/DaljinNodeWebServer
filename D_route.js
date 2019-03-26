var passport = require('./D_passport');


module.exports = function(app) {


    app.get('/login' , (req , res)=> {
        res.render('login.ejs');
    });

    app.post('/login' , passport.authenticate('login' , {
        successRedirect : '/menu',
        failureRedirect : '/login'
    }));

    app.get('/menu' , (req , res)=> {
        res.render('menu.ejs');
    });

    app.post('/menu' , (req , res)=> {

    });

}