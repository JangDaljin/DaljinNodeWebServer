var DBconfig = require('./D_dbconfig');
var mongoose = require('mongoose');

var database = {};
var D_Mongoose = {

    DB_URL: 'mongodb://' + DBconfig.DB_HOSTNAME + ':' + DBconfig.DB_PORT + '/' + DBconfig.DB_PATH
    ,
    connect: function () {
        mongoose.Promise = global.Promise;
        mongoose.connect(this.DB_URL, { useNewUrlParser: true });

        mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error'));

        mongoose.connection.on('open', function () {
            for (var i = 0; i < DBconfig.DB_SCHEMAS.length; i++) {
                var curItem = DBconfig.DB_SCHEMAS[i];

                curSchema = require(curItem.file).create(mongoose);
                curModel = mongoose.model(curItem.collection, curSchema);

                database[curItem.schemaName] = curSchema;
                database[curItem.modelName] = curModel;
            }
        });

        mongoose.connection.on('disconnected', function () {
            console.log('mongoose disconnected. retry connect');
            setInterval(connect, 5000);
        })
    }
};
module.exports.database = database;
module.exports.D_Mongoose = D_Mongoose;