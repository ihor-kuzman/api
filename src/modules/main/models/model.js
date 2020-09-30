import { Sequelize } from 'sequelize';

import isUnique from './utils/validators/is-unique';
import { spreadNewsExists } from './utils/spread';

export default class Model extends Sequelize.Model {
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
                subTitle: {
                    type: Sequelize.STRING(200),
                    validate: {
                        notEmpty: true,
                        len: [2, 200],
                    },
                    defaultValue: '',
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
                },
                thumbnail: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                },
                image: {
                    type: Sequelize.STRING,
                    defaultValue: '',
                },
                price: {
                    type: Sequelize.STRING(20),
                    defaultValue: '-',
                },
                rate: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0,
                },
                choice: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                highs: {
                    type: Sequelize.STRING(1000),
                    defaultValue: '',
                },
                lows: {
                    type: Sequelize.STRING(1000),
                    defaultValue: '',
                },
                verdict: {
                    type: Sequelize.STRING(1000),
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

    static associate({ Brand, Rating, Gallery, Spec }) {
        Model.belongsTo(Brand, {
            foreignKey: 'brandId',
            targetKey: 'id',
            as: 'brand',
        });
        Model.belongsToMany(Rating, {
            through: 'RatingsModels',
            foreignKey: 'modelId',
            otherKey: 'ratingId',
            as: 'ratings',
        });
        Model.hasOne(Gallery, {
            foreignKey: 'modelId',
            sourceKey: 'id',
            as: 'gallery',
        });
        Model.hasOne(Spec, {
            foreignKey: 'modelId',
            sourceKey: 'id',
            as: 'spec',
        });
    }

    static async findAndCreate(values, options) {
        const model = await Model.sequelize.transaction(async (transaction) => {
            const { existence, newest } = spreadNewsExists(values.ratings || []);
            delete values.ratings;

            const model = await Model.create(values, { transaction });
            if (!model) {
                return null;
            }

            await Promise.all(existence.map(rating => model.addRating(rating, { transaction })));
            await Promise.all(newest.map(rating => model.createRating(rating, { transaction })));

            return model;
        });
        return model ? Model.findByPk(model.id, options) : null;
    }

    static async findByPkAndUpdate(id, values, options) {
        const model = await Model.sequelize.transaction(async (transaction) => {
            const model = await Model.findByPk(id, { transaction });
            if (!model) {
                return null;
            }

            const { existence, newest } = spreadNewsExists(values.ratings || []);
            delete values.ratings;

            await model.update(values);
            await model.setRatings([], { transaction });
            await Promise.all(existence.map(rating => model.addRating(rating, { transaction })));
            await Promise.all(newest.map(rating => model.createRating(rating, { transaction })));

            return model;
        });
        return model ? Model.findByPk(model.id, options) : null;
    }
}
