var database = require('../database/D_mongoose').database

var authUser = function (id, password, callback) {

    

    tempModel.findById(id, function (err, results) {
        if (err) {
            callback(err, null);
            return;
        }

        if (results.length > 0) {

            var user = new tempModel({ id: id });
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if (authenticated) {
                callback(null, results);
            }
            else {
                callback(null, null);
            }
        }
        else {
            callback(null, null);
        }

    });
};


module.exports = function (req, res) {
    
    var paramId = req.body.ID || req.query.ID;
    var paramPassword = req.body.PW || req.query.PW;

    var tempModel = database.UserModel;

    tempModel.findById(paramId, function (err, results) {
        if (err) {
            res.redirect('/');
        }

        if (results.length > 0) {

            var user = new tempModel({ id: paramId });
            var authenticated = user.authenticate(paramPassword, results[0]._doc.salt, results[0]._doc.hashed_password);

            if (authenticated) {
                res.redirect('/process/menu');
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/');
        }
    });
};
