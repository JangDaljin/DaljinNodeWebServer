module.exports = (req , res , callback) => {

    var ID = req.body.ID || req.query.ID;
    var PW = req.body.PW || req.query.PW;
    var CODE = req.body.CODE || req.query.CODE;


    if(CODE != req.app.get('USER_AUTH_CODE')) {
        callback({});
        return;
    }

    var D_UserModel = req.app.get('D_UserModel');

    var UserModel = new D_UserModel(
        {
            id : ID,
            password : PW
        }
    );

    UserModel.save((err)=> {
        console.log('USER_ID : ' + ID + ' ' + 'USER_PW : ' + PW);
        if(err) {
            console.log('ADDUSER save error');
            callback(err);
        }
        console.log('ADDUSER save complete');
        callback(null);
    });
}