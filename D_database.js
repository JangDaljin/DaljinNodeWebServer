var mongoose = require('mongoose');
var DB_URL= require('./D_setting').DB_SETTING['DB_URL'];
var fs = require('fs');
var D_PATH = require('./D_setting').PATH;


var D_Mongoose = {};
var D_UserSchema = D_UserSchema = mongoose.Schema({
                        email: { type: String, required: true, unique: true, 'default': '' },
                        nickname : {type : String , require : true ,'default' : ''},
                        code: { type: String , require : true , 'default' : ''},
                        created_at: { type: Date, index: { unique: false }, 'default': Date.now },
                        updated_at: { type: Date, index: { unique: false }, 'default': Date.now },
                        max_storage : {type:Number , require:true ,'default' : 1024*1024*100},
                        grade : { type : String , require:true ,'default' : 'normal'}
                    });
var D_UserModel = mongoose.model('d_users' , D_UserSchema);

D_Mongoose.connect = (expressApp) => {
    mongoose.Promise = global.Promise;
    mongoose.set('useCreateIndex' , true);
    mongoose.connect(DB_URL, { useNewUrlParser: true });
    mongoose.connection.on('error', ()=> {

    });

    mongoose.connection.on('open', function () {
        console.log('[DB]Connecting DB');

        D_UserModel.find({}  , (err , results) => {
            for(var i = 0 ; i < results.length; i++) {
                try {
                    fs.mkdirSync(D_PATH["DOWNLOAD"] + '/' + results[i]._doc.email);
                    fs.mkdirSync(D_PATH["MEMO"] + '/' + results[i]._doc.email);
                }
                catch (e) {
                    console.log("[" + results[i]._doc.email + "] FOLDER ALREADY EXIST");
                }
            }
            console.log("[DB]CONNECT COMPLETE")
        });
    });

    mongoose.connection.on('disconnected', function () {
        console.log('[DB]DISCONNECTED');
        setInterval(_connect(expressApp), 5000);
    });
};

D_Mongoose.getAllUserData = async () => {
    var results = await D_UserModel.find({});
    var output = {};
    for(var i = 0 ; i < results.length; i++) {
        var userData = {};
        userData['email'] = results[i]._doc.email;
        userData['max_storage'] = results[i]._doc.max_storage;
        userData['grade'] = results[i]._doc.grade;
        output[i] = userData;
    }
    return output;
}


//유저삭제
D_Mongoose.userDelete = async (email) => {
    var res = false;
    var user = null;
    try {
        user = await D_UserModel.findOne({'email' : email});
    }
    catch(e) {
        console.log("USER DELETE REMOVE ERROR");
    }

    if(user != null) {
        try {
            user.remove();
            res = true;
            require('./D_file').moveTo(D_PATH["DOWNLOAD"] + '/' + user._doc.email 
                                     , D_PATH["TRASH_BIN"] + '/' + user._doc.email + '_' + user._doc.email);
        }
        catch(e) {

        }
    }
    return res;
}

//유저업데이트
D_Mongoose.userUpdate = async(email , grade , storage) => {
    var res = false;

    var user = null;
    try {
        user = await D_UserModel.findOne({'email' : email});
    }
    catch(e) {
        console.log("USER UPDATE FINDONE ERROR");
    }
    
    if(user != null) {
        user.grade = grade;
        user.max_storage = storage;
        try {
            await user.save();
            res = true;
        }
        catch(e) {
            console.log("USER UPDATE SAVE ERROR");
        }
    }

    return res;
}

D_Mongoose.userInfoUpdate = async(email , nickname , code) => {
    var user = null;

    try {
        user = await D_UserModel.findOne({'email' : email});
    }
    catch(e) {
        console.log("[" + email + "] USERINFO UPDATE ERROR");
    }

    if(user != null) {
        var setting = require('./D_setting').USER_SETTING;
        for(var i = 0 ; i < Object.keys(setting).length; i++) {
            if(code == setting[i].code) {
                user.code = setting[i].code;
                user.grade = setting[i].grade;
                user.max_storage = setting[i].max_storage;
                try {
                    await user.save();
                    return user;
                }
                catch(e) {
                    console.dir(e);
                    console.log("[" + email + "] SAVE ERROR AFTER CODE UPDATE");
                    return null;
                }
                break;
            }
        }
    }
    else {
        return null;
    }
}


module.exports.D_Mongoose = D_Mongoose;
module.exports.D_UserModel = D_UserModel;
module.exports.D_UserSchema = D_UserSchema;