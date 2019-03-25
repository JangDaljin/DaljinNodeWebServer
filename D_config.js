module.exports = {

    SERVER_HOSTNAME: 'localhost'
    ,
    SERVER_PORT: 3000
    ,

    route: [
        {
            path: '/page',
            Module: '/',
            type: 'static'
        }
        ,
        {
            path: '/',
            Module: '/page/index.html',
            type: 'redirect'
        }
        ,
        {
            path: '/process/login',
            Module: './process/login',
            type: 'post'
        }
        ,
        {
            path: '/process/menu',
            Module: './process/menu',
            type: 'post'
        }
        ,
        {
            path: '/process/addUser',
            Module: './process/addUser',
            type: 'post'
        }

    ]
    





}