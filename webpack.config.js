const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const common = require('./webpack.common');

module.exports = [
    common({
        name: 'bin',

        target: 'node',

        entry: {
            bin: path.resolve('src/bin/index.js'),
        },
        output: {
            path: path.resolve('build/bin'),
        },
    }),

    common({
        name: 'api',

        target: 'node',

        entry: {
            api: path.resolve('src/index.js'),
        },
        output: {
            path: path.resolve('build'),
        },

        plugins: [
            new NodemonPlugin({
                nodeArgs: ['-r', 'source-map-support/register'],
            }),
        ],
    })
];
