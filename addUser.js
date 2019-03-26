var database = require('../database/D_mongoose').database;


module.exports = function (req, res) {

    var paramId = req.body.ID || req.query.ID;
    var paramPassword = req.body.PW || req.query.PW;
    var paramName = req.body.NAME || req.query.NAME;
    
    var tempModel = database.UserModel;
    var user = new tempModel(
        {
            id: paramId,
            password: paramPassword,
            name: paramName
        }

    );
    
    user.save(function (err) {
        if (err) {
            console.log('user add error');
        }
        else {
            console.log('user add complete');
        }

    })

    res.redirect('/');
}