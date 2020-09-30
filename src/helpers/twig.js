import fs from 'fs-extra';
import url from 'url';
import path from 'path';
import Twig from 'twig';
import uniqid from 'uniqid';
import moment from 'moment';
import merge from 'lodash/merge';

import config from './config';

// Define version
const version = uniqid();

// Define namespaces
const namespaces = {};

// Patch path function
Twig.path.parsePath = (template, file) => namespaces[file] || file;
Twig.path.relativePath = (template, file) => namespaces[file] || file;

// Add 'isArray' filter
Twig.extendFilter('isArray', value => Array.isArray(value));

// Add 'base64' filter
Twig.extendFilter('base64', value => Buffer.from(value).toString('base64'));

// Add 'json' filter
Twig.extendFilter('json', (value, args = []) => {
    const [space] = args || [];
    return JSON.stringify(value, null, space);
});

// Add 'asset' function
Twig.extendFunction('asset', (value, options = {}) => {
    // Prepare link
    // eslint-disable-next-line no-param-reassign
    value = value.trim();

    // Return from manifest if exists
    return url.format(merge(url.parse(url.resolve(options.absolute ? config.get('domain') : '', value), true), {
        query: {
            ...(options.query || {}),
            v: version,
        },
    }));
});

// Add 'moment' function
Twig.extendFunction('moment', (...args) => moment(...args));

// Add parse path function
Twig.parsePath = file => Twig.path.parsePath(null, file);

// Add render file function
Twig.render = (template, options = {}, fn = null) => {
    // parse file path
    const file = Twig.parsePath(template);

    // generate html
    const html = Twig
        .twig({
            namespaces,
            data: fs.readFileSync(file, 'utf8'),
        })
        .render(options);

    // return html
    if (typeof fn === 'function') {
        fn(null, html);
    }
    return html;
};

// Load namespace from directory
Twig.load = (namespace, context) => {
    if (typeof context === 'function') {
        context.keys().forEach((key) => {
            namespaces[`@${path.join(namespace, key)}`] = path.join(__dirname, context(key));
        });
    } else {
        namespaces[`@${namespace}`] = context;
    }
};

// Export render
export default Twig;
