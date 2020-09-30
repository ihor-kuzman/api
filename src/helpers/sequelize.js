import { Sequelize } from 'sequelize';

import config from './config';
import logger from './logger';

export default {
    isConnected: false,
    sequelize: null,
    async connect() {
        if (!this.sequelize) {
            this.sequelize = new Sequelize(config.get('server.sequelize.uri'), {
                dialect: 'mariadb',
                dialectOptions: {
                    charset: 'utf8',
                    collate: 'utf8_general_ci',
                    connectTimeout: 1000,
                    useUTC: true,
                },
                logging: false,
                timezone: 'GMT',
                define: {
                    charset: 'utf8',
                    collate: 'utf8_general_ci',
                    paranoid: true,
                },
            });
        }
        if (!this.isConnected) {
            await this.sequelize.authenticate();
            this.isConnected = true;
        }
    },
    async load(namespace, context, force = false) {
        await this.connect();

        let models = {};
        if (typeof context === 'function') {
            models = context.keys().reduce((models, key) => {
                const model = context(key).default;
                return { ...models, [model.name]: model.init(this.sequelize) };
            }, {});
        } else {
            models = context.reduce((models, model) => ({ ...models, [model.name]: model.init(this.sequelize) }), {});
        }

        Object.values(models).forEach((model) => {
            if (typeof model.associate === 'function') {
                model.associate(models);
            }
        });

        return this.sync({ force });
    },
    async sync(options) {
        if (!this.isConnected) {
            logger.error('Connection has not been established!');
            return;
        }
        await this.sequelize.sync(options);
    },
    async close() {
        if (!this.isConnected) {
            logger.error('Connection has not been established!');
            return;
        }
        await this.sequelize.close();

        this.sequelize = null;
        this.isConnected = false;
    },
};
