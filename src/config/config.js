import path from 'path';

export default {
    server: {
        host: process.env.HOST || '127.0.0.1',
        port: process.env.PORT || 3000,
        redis: {
            uri: process.env.REDIS_URI || 'redis://127.0.0.1:6379',
        },
        mongoose: {
            uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cars',
        },
        sequelize: {
            uri: process.env.SEQUELIZE_URI || 'mariadb://cars:bvvbx4679pjsa@127.0.0.1:3306/cars',
        },
        parser: {
            extended: false,
            limit: '5mb',
        },
        session: {
            secret: 'sd23rk0asd8324yasd',
        },
        logger: {
            level: 'debug',
            dest: path.resolve(__dirname, '../runtime/logger'),
        },
    },
};
