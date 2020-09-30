import sequelize from '../../../helpers/sequelize';

import Brand from '../../../modules/main/models/brand';
import Model from '../../../modules/main/models/model';
import Gallery from '../../../modules/main/models/gallery';
import Spec from '../../../modules/main/models/spec';
import Rating from '../../../modules/main/models/rating';

import cars from './data/seeds.json';

export const command = 'seeds';
export const describe = 'Run every seeder';
export const builder = {};
export async function handler() {
    console.log('Seeds started...');

    await sequelize.load('cars', [Brand, Model, Gallery, Spec, Rating], true);

    await cars.brands.reduce(async (promise, brand) => {
        await promise;

        await Brand.create(
            {
                slug: brand.title.toLowerCase().replace(/[\W_]+/g, '-'),
                title: brand.title,
                description: brand.meta.description || null,
                keywords: brand.meta.keywords || null,
                content: brand.description,
                thumbnail: brand.image,
                image: brand.image,
                status: 'processing',
                models: await brand.models.reduce(async (promise, model) => {
                    const models = await promise;
                    return [
                        ...models,
                        {
                            slug: model.title.toLowerCase().replace(/[\W_]+/g, '-'),
                            title: model.title,
                            subTitle: model.subTitle || null,
                            description: model.json.description || null,
                            keywords: model.meta.keywords || null,
                            content: model.content.join(''),
                            thumbnail: model.json.image.thumbnail,
                            image: model.json.image.url,
                            price: model.price.replace(/\s+/g, ' ').trim(),
                            rate: +(model.rate || '').toString().split('/')[0] || 0,
                            choice: model.choice,
                            highs: model.summary[0] || '',
                            lows: model.summary[1] || '',
                            verdict: model.summary[2] || '',
                            status: 'processing',

                            ...Object.keys(model.gallery).length
                                ? {
                                    gallery: {
                                        slug: model.gallery.meta.title.toLowerCase().replace(/[\W_]+/g, '-'),
                                        title: model.gallery.meta.title,
                                        description: model.gallery.meta.description || null,
                                        keywords: model.gallery.meta.keywords || null,
                                        slides: model.gallery.slides,
                                        thumbnail: model.gallery.json.image.thumbnail,
                                        image: model.gallery.json.image.url,
                                    },
                                }
                                : {},

                            ...Object.keys(model.specs).length
                                ? {
                                    spec: {
                                        slug: model.specs.meta.title.toLowerCase().replace(/[\W_]+/g, '-'),
                                        title: model.specs.meta.title,
                                        description: model.specs.meta.description || null,
                                        keywords: model.specs.meta.keywords || null,
                                        sections: model.specs.sections,
                                        thumbnail: model.specs.json.image.thumbnail,
                                        image: model.specs.json.image.url,
                                    },
                                }
                                : {},
                        },
                    ];
                }, Promise.resolve([])),
            },
            {
                include: [
                    {
                        model: Model,
                        as: 'models',
                        include: [
                            {
                                model: Gallery,
                                as: 'gallery',
                                validate: false,
                            },
                            {
                                model: Spec,
                                as: 'spec',
                                validate: false,
                            },
                        ],
                        validate: false,
                    },
                ],
                validate: false,
            },
        );
    }, Promise.resolve());

    await sequelize.close();

    console.log('Seeds successfully finished!');
}
