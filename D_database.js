var mongoose = require('mongoose');
var crypto = require('crypto');
//var DB_HOSTNAME     = 'localhost';
//var DB_PORT         =  27017;
//var DB              = 'local'
//var DB_URL =  'mongodb://' + DB_HOSTNAME + ':' + DB_PORT + '/' + DB
var DB_URL= 'mongodb+srv://rw:ufwlds@daljin-mcs3v.gcp.mongodb.net/test?retryWrites=true'


var D_Mongoose = {};
var D_UserSchema = null;
var D_UserModel = null;

D_Mongoose.connect = (expressApp) => {
    _connect(expressApp);
};

var _connect = (expressApp) => {
    mongoose.Promise = global.Promise;
    mongoose.set('useCreateIndex' , true);
    mongoose.connect(DB_URL, { useNewUrlParser: true });
    mongoose.connection.on('error', ()=> {

    });

    mongoose.connection.on('open', function () {
        console.log('trying to connect DB');
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //USER_SCHEMA / MODEL
        D_UserSchema = mongoose.Schema({
            id: { type: String, required: true, unique: true, 'default': ' ' },
            hashed_password: { type: String, required: true, 'default': ' ' },
            salt: { type: String, required: true },
            created_at: { type: Date, index: { unique: false }, 'default': Date.now },
            updated_at: { type: Date, index: { unique: false }, 'default': Date.now },
            max_storage : {type:Number , require:true ,'default' : 1024*1024*100},
            grade : { type : String , require:true ,'default' : 'normal'}
        });

        D_UserSchema
        .virtual('password')
        .set(function (password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        })
        .get(function () { return this._password });

        //패스워드 암호화
        D_UserSchema
        .method('encryptPassword', function (plainText, inSalt) {
            if (inSalt) {
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            }
            else {
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
            }
        });

        //솔트 값 설정
        D_UserSchema
        .method('makeSalt', function () {
            return Math.round((new Date().valueOf() * Math.random())) + '';
        });

        //패스워드 검증
        D_UserSchema
        .method('authenticate', function (plainText, inSalt, hashed_password) {
            if (inSalt) {
                return this.encryptPassword(plainText, inSalt) == hashed_password;
            }
            else {
                return this.encryptPassword(plainText) == hashed_password;
            }
        });

        D_UserModel = mongoose.model('d_users' , D_UserSchema)
        
        //앱에 등록
        expressApp.set('D_UserSchema' , D_UserSchema);
        expressApp.set('D_UserModel' , D_UserModel);

        console.log('DB CONNECT COMPLETE');
    });

    mongoose.connection.on('disconnected', function () {
        console.log('DB DISCONNECTED');
        setInterval(_connect(expressApp), 5000);
    });
}

D_Mongoose.getAllUserData = async () => {
    var results = await D_UserModel.find({});
    var output = {};
    for(var i = 0 ; i < results.length; i++) {
        var userData = {};
        userData['id'] = results[i]._doc.id;
        userData['max_storage'] = results[i]._doc.max_storage;
        userData['grade'] = results[i]._doc.grade;
        output[i] = userData;
    }
    return output;
}

//유저 등록시 아이디 중복체크
D_Mongoose.user_ID_Check = async (id) => {
    var results = await D_UserModel.find({'id' : id});
    if(results.length == 0) {
        return true;
    }
    else {
        return false;
    }
}

//유저 등록시 비밀번호 정규식 체크(8자리부터 15자리 )
D_Mongoose.user_PW_Check = (pw) => {
    var regex = new RegExp('^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$');
    return regex.test(pw);
}

D_Mongoose.userDelete = async (id) => {
    var res = false;
    var user = null;
    try {
        user = await D_UserModel.findOne({'id' : id});
    }
    catch(e) {
        console.log("USER DELETE REMOVE ERROR");
    }

    if(user != null) {
        try {
            user.remove();
            res = true;
        }
        catch(e) {

        }
    }
    return res;
}

D_Mongoose.userUpdate = async(id , grade , storage) => {
    var res = false;

    var user = null;
    try {
        user = await D_UserModel.findOne({'id' : id});
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


module.exports.D_Mongoose = D_Mongoose;