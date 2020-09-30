import { Sequelize } from 'sequelize';

import isUnique from './utils/validators/is-unique';
import { spreadNewsExists } from './utils/spread';

export default class Brand extends Sequelize.Model {
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
        Brand.hasMany(Model, {
            foreignKey: 'brandId',
            sourceKey: 'id',
            as: 'models',
        });
    }

    static async findAndCreate(values, options) {
        const brand = await Brand.sequelize.transaction(async (transaction) => {
            const { existence, newest } = spreadNewsExists(values.models || []);
            delete values.models;

            const brand = await Brand.create(values, { transaction });
            if (!brand) {
                return null;
            }

            await Promise.all(existence.map(model => brand.addModel(model, { transaction })));
            await Promise.all(newest.map(model => brand.createModel(model, { transaction })));

            return brand;
        });
        return brand ? Brand.findByPk(brand.id, options) : null;
    }

    static async findByPkAndUpdate(id, values, options) {
        const brand = await Brand.sequelize.transaction(async (transaction) => {
            const brand = await Brand.findByPk(id, { transaction });
            if (!brand) {
                return null;
            }

            const { existence, newest } = spreadNewsExists(values.models || []);
            delete values.models;

            await brand.update(values);
            await brand.setModels([], { transaction });
            await Promise.all(existence.map(model => brand.addModel(model, { transaction })));
            await Promise.all(newest.map(model => brand.createModel(model, { transaction })));

            return brand;
        });
        return brand ? Brand.findByPk(brand.id, options) : null;
    }
}
