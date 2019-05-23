module.exports = function(app) {
    var router = require('express').Router();

    router.get('/' , (req , res) =>  {

        res.render('calender.ejs');


    });



    return router;
}