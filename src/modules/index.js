import config from '../helpers/config';
import sequelize from '../helpers/sequelize';
import twig from '../helpers/twig';

import main from './main';
import error from './error';

/**
 * Register modules in application
 *
 * @param {Express} app - Express application
 * @return {Promise<void>} - Promise
 */
export default async app => (
    [
        main,
        error,
    ]
        .reduce(async (promise, bundle) => {
            // wait bundles
            const bundles = await promise;

            // validate bundle
            if (!bundle.name) {
                throw new Error(`Undefined bundle structure: "name" property not found. ${JSON.stringify(bundle)}`);
            }

            // load dependencies
            if (bundle.config) {
                await config.load(bundle.name, bundle.config);
            }
            if (bundle.models) {
                await sequelize.load(bundle.name, bundle.models);
            }
            if (bundle.views) {
                await twig.load(bundle.name, bundle.views);
            }
            return [...bundles, bundle];
        }, Promise.resolve([]))
        .then(bundles => bundles.reduce(async (promise, bundle) => {
            // wait promise
            await promise;

            // call bundle handler
            if (bundle.handler) {
                await bundle.handler(app);
            }
        }, Promise.resolve()))
);
