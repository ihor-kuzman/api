module.exports = api => ({
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                targets: api.caller(caller => caller && caller.target === 'node')
                    ? { node: 'current' }
                    : { browsers: 'defaults' },
                corejs: 3,
            },
        ],
        [
            '@babel/preset-react',
            {
                development: process.env.NODE_ENV !== 'production',
            },
        ],
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
});
