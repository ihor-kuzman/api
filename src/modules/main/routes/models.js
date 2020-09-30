import { Op } from 'sequelize';
import { Router } from 'express';
import { NotFound } from 'http-errors';

import * as qs from '../../../common/utils/qs';

import Brand from '../models/brand';
import Model from '../models/model';
import Rating from '../models/rating';
import Gallery from '../models/gallery';
import Spec from '../models/spec';

export default new Router()
    /**
     * GET /models?page=<number>&size=<number>&filters=<column1>:<value1,value2>;<column2>:<value1,value2>
     *  - request:
     *      /models?page=1
     *      /models?page=1&size=40
     *      /models?page=1&size=10&filters=status:published
     *
     *  - response:
     *      {
     *          models: [Model], - array of models filtered by params and joined with gallery and specs
     *          total: number, - total count of models
     *      }
     */
    .get('/', async (req, res) => {
        const { query } = req;

        const size = Math.abs(query.size) || 10;
        const page = Math.abs(query.page) || 1;
        const filters = qs.parseSub(query.filters || '');

        const where = {
            ...filters.status ? { status: { [Op.in]: filters.status } } : {},
        };

        const models = await Model.findAll({
            where,
            include: [
                {
                    model: Brand,
                    as: 'brand',
                    where: {
                        ...filters.brand ? { title: { [Op.in]: filters.brand.title || [] } } : {},
                    },
                    attributes: ['id', 'title'],
                    required: !!filters.brand,
                },
            ],
            order: [
                ['id', 'DESC'],
            ],
            offset: size * (page - 1),
            limit: size,
        });
        const total = await Model.count({ where });

        res.json({
            models,
            total,
        });
    })

    .get('/brands', async (req, res) => {
        const brands = await Brand.findAll({
            attributes: ['id', 'title'],
        });

        res.json(brands);
    })

    .get('/ratings', async (req, res) => {
        const ratings = await Rating.findAll({
            attributes: ['id', 'title'],
        });

        res.json(ratings);
    })

    .get('/:id', async (req, res) => {
        const { params } = req;

        const model = await Model.findOne({
            where: {
                [Number.isNaN(+params.id) ? 'slug' : 'id']: params.id,
            },
            include: [
                {
                    model: Rating,
                    as: 'ratings',
                    through: { attributes: [] },
                },
                {
                    model: Gallery,
                    as: 'gallery',
                },
                {
                    model: Spec,
                    as: 'spec',
                },
            ],
        });
        if (!model) {
            throw new NotFound();
        }

        res.json(model);
    })

    .post('/', async (req, res) => {
        const { body } = req;

        const model = await Model.findAndCreate(
            {
                brandId: body.brandId,
                slug: body.slug,
                title: body.title,
                subTitle: body.subTitle,
                description: body.description,
                keywords: body.keywords,
                content: body.content,
                thumbnail: body.thumbnail,
                image: body.image,
                price: body.price,
                rate: body.rate,
                choice: body.choice,
                highs: body.highs,
                lows: body.lows,
                verdict: body.verdict,
                ratings: body.ratings,
                status: body.status,
            },
            {
                include: [
                    {
                        model: Rating,
                        as: 'ratings',
                        through: { attributes: [] },
                    },
                    {
                        model: Gallery,
                        as: 'gallery',
                    },
                    {
                        model: Spec,
                        as: 'spec',
                    },
                ],
            },
        );
        if (!model) {
            throw new NotFound();
        }

        res.json(model);
    })

    .put('/:id', async (req, res) => {
        const { params, body } = req;

        const model = await Model.findByPkAndUpdate(
            params.id,
            {
                brandId: body.brandId,
                slug: body.slug,
                title: body.title,
                subTitle: body.subTitle,
                description: body.description,
                keywords: body.keywords,
                content: body.content,
                thumbnail: body.thumbnail,
                image: body.image,
                price: body.price,
                rate: body.rate,
                choice: body.choice,
                highs: body.highs,
                lows: body.lows,
                verdict: body.verdict,
                ratings: body.ratings,
                status: body.status,
            },
            {
                include: [
                    {
                        model: Rating,
                        as: 'ratings',
                        through: { attributes: [] },
                    },
                    {
                        model: Gallery,
                        as: 'gallery',
                    },
                    {
                        model: Spec,
                        as: 'spec',
                    },
                ],
            },
        );
        if (!model) {
            throw new NotFound();
        }

        res.json(model);
    })

    .delete('/:id', async (req, res) => {
        const { params } = req;

        const affected = await Model.destroy({
            where: {
                id: params.id,
            },
        });
        if (!affected) {
            throw new NotFound();
        }

        res.json({
            affected,
        });
    });
