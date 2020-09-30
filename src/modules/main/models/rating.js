import { Sequelize } from 'sequelize';

import isUnique from './utils/validators/is-unique';
import { spreadNewsExists } from './utils/spread';

export default class Rating extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                slug: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                    validate: {
                        notNull: true,
                        notEmpty: true,
                        len: [2, 200],
                        isUnique: isUnique('slug'),
                    },
                },
                title: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                    validate: {
                        notNull: true,
                        notEmpty: true,
                        len: [2, 200],
                    },
                },
                description: {
                    type: Sequelize.STRING(1000),
                    validate: {
                        notEmpty: true,
                        len: [2, 1000],
                    },
                    defaultValue: '',
                },
                keywords: {
                    type: Sequelize.STRING(600),
                    validate: {
                        notEmpty: true,
                        len: [2, 600],
                    },
                    defaultValue: '',
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    validate: {
                        notNull: true,
                        notEmpty: true,
                    },
                },
                thumbnail: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                },
                image: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                },
                status: {
                    type: Sequelize.ENUM('processing', 'published', 'warning', 'error'),
                    defaultValue: 'processing',
                },
            },
            { sequelize },
        );
    }

    static associate({ Model }) {
        Rating.belongsToMany(Model, {
            through: 'RatingsModels',
            foreignKey: 'ratingId',
            otherKey: 'modelId',
            as: 'models',
        });
    }

    static async findAndCreate(values, options) {
        const rating = await Rating.sequelize.transaction(async (transaction) => {
            const { existence, newest } = spreadNewsExists(values.models || []);
            delete values.models;

            const rating = await Rating.create(values, { transaction });
            if (!rating) {
                return null;
            }

            await Promise.all(existence.map(model => rating.addModel(model, { transaction })));
            await Promise.all(newest.map(model => rating.createModel(model, { transaction })));

            return rating;
        });
        return rating ? Rating.findByPk(rating.id, options) : null;
    }

    static async findByPkAndUpdate(id, values, options) {
        const rating = await Rating.sequelize.transaction(async (transaction) => {
            const rating = await Rating.findByPk(id, { transaction });
            if (!rating) {
                return null;
            }

            const { existence, newest } = spreadNewsExists(values.models || []);
            delete values.models;

            await rating.update(values);
            await rating.setModels([], { transaction });
            await Promise.all(existence.map(model => rating.addModel(model, { transaction })));
            await Promise.all(newest.map(model => rating.createModel(model, { transaction })));

            return rating;
        });
        return rating ? Rating.findByPk(rating.id, options) : null;
    }
}
