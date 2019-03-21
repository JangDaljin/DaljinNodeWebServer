module.exports = {
    DB_HOSTNAME: 'localhost'
    ,
    DB_PORT: '27017'
    ,
    DB_PATH: 'local'
    ,
    DB_SCHEMAS: [
        {
            //USER DATABASE
            file: './schemas/D_user',
            collection: 'User',
            schemaName: 'UserSchema',
            modelName: 'UserModel'
        }
    ]
}