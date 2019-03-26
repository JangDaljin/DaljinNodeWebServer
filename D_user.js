var crypto = require('crypto');

var Schema = {};

Schema.create = function (mongoose) {
    var tempSchema = mongoose.Schema({
        id: { type: String, required: true, unique: true, 'default': ' ' },
        hashed_password: { type: String, required: true, 'default': ' ' },
        salt: { type: String, required: true },
        name: { type: String, index: 'hashed', 'default': ' ' },

        age: { type: Number, 'default': -1 },
        created_at: { type: Date, index: { unique: false }, 'default': Date.now },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now }
    });

    tempSchema
        .virtual('password')
        .set(function (password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
        })
        .get(function () { return this._password });


    tempSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        }
        else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    tempSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    tempSchema.method('authenticate', function (plainText, inSalt, hashed_password) {
        if (inSalt) {
            console.log('authenticate called : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
            return this.encryptPassword(plainText, inSalt) == hashed_password;
        }
        else {
            console.log('authenticate called : %s -> %s : %s', plainText, this.encryptPassword(plainText), hashed_password);
            return this.encryptPassword(plainText) == hashed_password;
        }
    })

    tempSchema.path('id').validate(function (id) {
        return id.length;
    }, 'There is no id column value');

    tempSchema.path('name').validate(function (name) {
        return name.length;
    }, 'There is no name column value');

    tempSchema.static('findById', function (id, callback) {
        return this.find({ id: id }, callback);
    });

    tempSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });


    return tempSchema;
}

module.exports = Schema;







