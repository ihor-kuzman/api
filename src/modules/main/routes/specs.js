import { Op } from 'sequelize';
import { Router } from 'express';
import { NotFound } from 'http-errors';

import * as qs from '../../../common/utils/qs';

import Model from '../models/model';
import Spec from '../models/spec';

export default new Router()
    .get('/', async (req, res) => {
        const { query } = req;

        const size = Math.abs(query.size) || 10;
        const page = Math.abs(query.page) || 1;
        const filters = qs.parseSub(query.filters || '');

        const where = {
            ...filters.status ? { status: { [Op.in]: filters.status } } : {},
        };

        const specs = await Spec.findAll({
            where,
            include: [
                {
                    model: Model,
                    as: 'model',
                    attributes: ['id', 'title'],
                },
            ],
            order: [
                ['id', 'DESC'],
            ],
            offset: size * (page - 1),
            limit: size,
        });
        const total = await Spec.count({ where });

        res.json({
            specs,
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

        const spec = await Spec.findByPk(params.id, {
            include: [
                {
                    model: Model,
                    as: 'model',
                    attributes: ['id', 'title'],
                },
            ],
        });
        if (!spec) {
            throw new NotFound();
        }

        const specs = await Spec.findAll({});

        const group = {};
        specs.forEach((spec) => {
            group[spec.sections.length] = spec.sections.map(section => section.title);
        });
        console.log(group);

        res.json(spec);
    });

// .post('/', async (req, res) => {
//     const { body } = req;
//
//     const brand = await Brand.findAndCreate(
//         {
//             slug: body.slug,
//             title: body.title,
//             keywords: body.keywords,
//             description: body.description,
//             content: body.content,
//             thumbnail: body.thumbnail,
//             image: body.image,
//             models: body.models,
//             status: body.status,
//         },
//         {
//             include: [
//                 {
//                     model: Model,
//                     as: 'models',
//                     attributes: ['id', 'title'],
//                 },
//             ],
//         },
//     );
//     if (!brand) {
//         throw new NotFound();
//     }
//
//     res.json(brand);
// })
//
// .put('/:id', async (req, res) => {
//     const { params, body } = req;
//
//     const brand = await Brand.findByPkAndUpdate(
//         params.id,
//         {
//             slug: body.slug,
//             title: body.title,
//             keywords: body.keywords,
//             description: body.description,
//             content: body.content,
//             thumbnail: body.thumbnail,
//             image: body.image,
//             models: body.models,
//             status: body.status,
//         },
//         {
//             include: [
//                 {
//                     model: Model,
//                     as: 'models',
//                     attributes: ['id', 'title'],
//                 },
//             ],
//         },
//     );
//     if (!brand) {
//         throw new NotFound();
//     }
//
//     res.json(brand);
// })
//
// .delete('/:id', async (req, res) => {
//     const { params } = req;
//
//     const affected = await Brand.destroy({
//         where: {
//             id: params.id,
//         },
//     });
//     if (!affected) {
//         throw new NotFound();
//     }
//
//     res.json({
//         affected,
//     });
// });
