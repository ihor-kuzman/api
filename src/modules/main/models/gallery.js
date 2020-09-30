import { Sequelize } from 'sequelize';

import isUnique from './utils/validators/is-unique';

export default class Gallery extends Sequelize.Model {
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
                slides: {
                    type: Sequelize.TEXT,
                    get() {
                        return JSON.parse(this.getDataValue('slides'));
                    },
                    set(value) {
                        return this.setDataValue('slides', JSON.stringify(value));
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
        Gallery.belongsTo(Model, {
            foreignKey: 'modelId',
            targetKey: 'id',
            as: 'model',
        });
    }
}
