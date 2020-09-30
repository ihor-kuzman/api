import { Op } from 'sequelize';
import { Router } from 'express';
import { NotFound } from 'http-errors';

import * as qs from '../../../common/utils/qs';

import Brand from '../models/brand';
import Model from '../models/model';

export default new Router()
    /**
     * GET /brands?page=<number>&size=<number>&filters=<column1>:<value1,value2>;<column2>:<value1,value2>
     *  - request:
     *      /brands?page=1
     *      /brands?page=1&size=40
     *      /brands?page=1&size=10&filters=status:published
     *      /brands?page=1&size=10&filters=brand.title=Audi;status:processing,published
     *
     *  - response:
     *      {
     *          brands: [Brand], - array of brands filtered by params
     *          total: number, - total count of brands
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

        const brands = await Brand.findAll({
            where,
            include: [
                {
                    model: Model,
                    as: 'models',
                    attributes: ['id', 'title'],
                },
            ],
            order: [
                ['id', 'DESC'],
            ],
            offset: size * (page - 1),
            limit: size,
        });
        const total = await Brand.count({ where });

        res.json({
            brands,
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

        const brand = await Brand.findByPk(params.id, {
            include: [
                {
                    model: Model,
                    as: 'models',
                    attributes: ['id', 'title'],
                },
            ],
        });
        if (!brand) {
            throw new NotFound();
        }

        res.json(brand);
    })

    .post('/', async (req, res) => {
        const { body } = req;

        const brand = await Brand.findAndCreate(
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
                        model: Model,
                        as: 'models',
                        attributes: ['id', 'title'],
                    },
                ],
            },
        );
        if (!brand) {
            throw new NotFound();
        }

        res.json(brand);
    })

    .put('/:id', async (req, res) => {
        const { params, body } = req;

        const brand = await Brand.findByPkAndUpdate(
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
                        model: Model,
                        as: 'models',
                        attributes: ['id', 'title'],
                    },
                ],
            },
        );
        if (!brand) {
            throw new NotFound();
        }

        res.json(brand);
    })

    .delete('/:id', async (req, res) => {
        const { params } = req;

        const affected = await Brand.destroy({
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
