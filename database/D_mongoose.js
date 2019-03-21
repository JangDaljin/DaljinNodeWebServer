var DBconfig = require('./D_dbconfig');

var database = {};

var D_Mongoose = {


    mongoose : require('mongoose')
    ,
    DB_URL: 'mongodb://' + DBconfig.DB_HOSTNAME + ':' + DBconfig.DB_PORT + '/' + DBconfig.DB_PATH
    ,
    connect: function () {
        this.mongoose.Promise = global.Promise;
        this.mongoose.connect(this.DB_URL);

        this.mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error'));

        this.mongoose.connection.on('open', function () {

            for (var i = 0; i < DBconfig.DB_SCHEMAS.length; i++) {
                var curItem = DBconfig.DB_SCHEMAS[i];

                curSchema = require(curItem.file).create();
                curModel = this.mongoose.model(curItem.collection, curSchema);

                database[curItem.UserSchema] = curSchema;
                database[curItem.UserModel] = curModel;
            }
        });

        this.mongoose.connection.on('disconnected', function () {
            console.log('mongoose disconnected. retry connect');
            setInterval(connect, 5000);
        })

        return database;
    }
};
module.exports.database = database;
module.exports.D_Mongoose = D_Mongoose;