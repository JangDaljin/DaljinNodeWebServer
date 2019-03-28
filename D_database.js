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
            updated_at: { type: Date, index: { unique: false }, 'default': Date.now }
        });

        D_UserSchema
        .virtual('password')
        .set(function (password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        })
        .get(function () { return this._password });

        //비밀번호 암호화
        D_UserSchema
        .method('encryptPassword', function (plainText, inSalt) {
            if (inSalt) {
                return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            }
            else {
                return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
            }
        });

        //솔트 값 생성
        D_UserSchema
        .method('makeSalt', function () {
            return Math.round((new Date().valueOf() * Math.random())) + '';
        });

        //비밀번호 검증
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
        
        //앱 설정에 등록
        expressApp.set('D_UserSchema' , D_UserSchema);
        expressApp.set('D_UserModel' , D_UserModel);

        console.log('connect DB Complete');
    });

    mongoose.connection.on('disconnected', function () {
        setInterval(_connect(expressApp), 5000);
    });
}


D_Mongoose.connect = (expressApp) => {
    _connect(expressApp);
};


module.exports.D_Mongoose = D_Mongoose;