import { Op } from 'sequelize';
import { Router } from 'express';
import { NotFound } from 'http-errors';

import * as qs from '../../../common/utils/qs';

import Model from '../models/model';
import Rating from '../models/rating';
import Gallery from '../models/gallery';
import Spec from '../models/spec';

export default new Router()
    /**
     * GET /ratings?page=<number>&size=<number>&filters=<column1>:<value1,value2>;<column2>:<value1,value2>
     *  - request:
     *      /ratings?page=1
     *      /ratings?page=1&size=40
     *      /ratings?page=1&size=10&filters=status:published
     *
     *  - response:
     *      {
     *          ratings: [Rating], - array of ratings filtered by params and joined with models
     *          total: number, - total count of ratings
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

        const ratings = await Rating.findAll({
            where,
            include: [
                {
                    through: { attributes: [] },
                    model: Model,
                    as: 'models',
                    include: [
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
            ],
            order: [
                ['id', 'DESC'],
            ],
            offset: size * (page - 1),
            limit: size,
        });
        const total = await Rating.count({ where });

        res.json({
            ratings,
            total,
        });
    })

    .get('/models', async (req, res) => {
        const models = await Model.findAll({
            attributes: ['id', 'title'],
        });

        res.json(models);
    })

    .get('/:id', async (req, res) => {
        const { params } = req;

        const rating = await Rating.findOne({
            where: {
                [Number.isNaN(+params.id) ? 'slug' : 'id']: params.id,
            },
            include: [
                {
                    through: { attributes: [] },
                    model: Model,
                    as: 'models',
                    include: [
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
            ],
        });
        if (!rating) {
            throw new NotFound();
        }

        res.json(rating);
    })

    .post('/', async (req, res) => {
        const { body } = req;

        const rating = await Rating.findAndCreate(
            {
                slug: body.slug,
                title: body.title,
                keywords: body.keywords,
                description: body.description,
                content: body.content,
                thumbnail: body.thumbnail,
                image: body.image,
                models: body.models,
                status: body.status,
            },
            {
                include: [
                    {
                        through: { attributes: [] },
                        model: Model,
                        as: 'models',
                    },
                ],
            },
        );
        if (!rating) {
            throw new NotFound();
        }

        res.json(rating);
    })

    .put('/:id', async (req, res) => {
        const { params, body } = req;

        const rating = await Rating.findByPkAndUpdate(
            params.id,
            {
                slug: body.slug,
                title: body.title,
                keywords: body.keywords,
                description: body.description,
                content: body.content,
                thumbnail: body.thumbnail,
                image: body.image,
                models: body.models,
                status: body.status,
            },
            {
                include: [
                    {
                        through: { attributes: [] },
                        model: Model,
                        as: 'models',
                    },
                ],
            },
        );
        if (!rating) {
            throw new NotFound();
        }

        res.json(rating);
    })

    .delete('/:id', async (req, res) => {
        const { params } = req;

        const affected = await Rating.destroy({
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
