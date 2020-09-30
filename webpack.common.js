/* eslint-disable import/no-extraneous-dependencies */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Require dependencies
const path = require('path');
const { DefinePlugin, ContextReplacementPlugin, HotModuleReplacementPlugin, optimize: { OccurrenceOrderPlugin } } = require('webpack');
const merge = require('webpack-merge');
const externals = require('webpack-node-externals');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');

const packageJson = require('./package.json');

// Define is dev mode
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Define defaults config
module.exports = (config, isSSR = false) => {
    const common = {
        mode: isDev ? 'development' : 'production',
        bail: !isDev,
        profile: false,
        devtool: isDev ? 'cheap-module-source-map' : false,

        output: {
            pathinfo: isDev,
            filename: '[name].bundle.js',
            chunkFilename: '[name].chunk.js',
            publicPath: '/',
            devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
            jsonpFunction: `webpackJsonp_${packageJson.name}`,
            globalObject: 'this',
            // TODO: remove this when upgrading to webpack 5
            futureEmitAssets: true,
        },

        module: {
            rules: [
                {
                    test: /\.m?jsx?$/,
                    enforce: 'pre',
                    include: path.resolve('src'),
                    loader: require.resolve('eslint-loader'),
                    options: {
                        cache: false,
                        formatter: require.resolve('react-dev-utils/eslintFormatter'),
                        configFile: path.resolve('.eslintrc.js'),
                    },
                },
                {
                    oneOf: [
                        {
                            test: /\.m?jsx?$/,
                            include: path.resolve('src'),
                            loader: require.resolve('babel-loader'),
                            options: {
                                cacheDirectory: false,
                                cacheCompression: false,
                                configFile: path.resolve('.babelrc.js'),
                            },
                        },
                        {
                            test: /\.ya?ml$/,
                            include: path.resolve('src'),
                            use: [
                                require.resolve('json-loader'),
                                require.resolve('yaml-loader'),
                            ],
                        },
                        {
                            test: /\.(sa|sc|c)ss$/,
                            use: [
                                !isSSR && {
                                    loader: MiniCssExtractPlugin.loader,
                                    options: {
                                        hmr: isDev,
                                    },
                                },
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        modules: {
                                            mode: resourcePath => (/node_modules/.test(resourcePath) ? 'global' : 'local'),
                                            // exportGlobals: true,
                                        },
                                        localsConvention: 'camelCaseOnly',
                                        importLoaders: 3,
                                        onlyLocals: isSSR,
                                        sourceMap: true,
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: {
                                        ident: 'postcss',
                                        plugins: () => [
                                            require('postcss-preset-env')({
                                                autoprefixer: {
                                                    flexbox: 'no-2009',
                                                },
                                                stage: 3,
                                            }),
                                            require('postcss-normalize')(),
                                            !isDev && require('cssnano')(),
                                        ].filter(Boolean),
                                        sourceMap: true,
                                    },
                                },
                                {
                                    loader: require.resolve('resolve-url-loader'),
                                    options: {
                                        sourceMap: true,
                                    },
                                },
                                {
                                    loader: require.resolve('sass-loader'),
                                    options: {
                                        sourceMap: true,
                                    },
                                },
                            ].filter(Boolean),
                        },
                        {
                            exclude: [/\.m?jsx?$/, /\.json$/, /\.ya?ml$/, /\.(sa|sc|c)ss$/, /\.html$/],
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'media/[name].[hash].[ext]',
                                emitFile: !isSSR,
                                esModule: false,
                            },
                        },
                    ],
                },
            ],
        },

        plugins: [
            new DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
            new CleanPlugin(),
            new OccurrenceOrderPlugin(),
            new ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru/),
            new ModuleNotFoundPlugin(path.resolve('src')),
            new CaseSensitivePathsPlugin(),

            config.target === 'web' && isDev && new HotModuleReplacementPlugin(),

            !isSSR && new MiniCssExtractPlugin({
                filename: '[name].bundle.css',
                chunkFilename: '[name].chunk.css',
                sourceMap: true,
            }),
        ].filter(Boolean),

        resolve: {
            plugins: [
                new ModuleScopePlugin([
                    path.resolve('libs'),
                    path.resolve('src'),
                ]),
            ],
        },

        stats: {
            all: false,
            // hash: true,
            // version: true,
            // builtAt: true,
            // timings: true,
            // publicPath: true,
            assets: true,
            // entrypoints: true,
            // chunks: true,
            warnings: true,
            errors: true,
            // errorDetails: true,
            // performance: true,
            // cached: true,
            colors: true,
        },

        optimization: {
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        keep_classnames: false,
                        keep_fnames: false,
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                    sourceMap: false,
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: require('postcss-safe-parser'),
                        map: false,
                    },
                    cssProcessorPluginOptions: {
                        preset: ['default', { minifyFontValues: { removeQuotes: false } }],
                    },
                }),
            ],

            ...config.target === 'web'
                ? {
                    splitChunks: {
                        chunks: 'all',
                        name: false,
                        // cacheGroups: {
                        //     modules: {
                        //         test: /[\\/]node_modules[\\/]/,
                        //         name: (module, chunks, groupKey) => `${chunks.map(item => item.name).join('~')}.${groupKey}`,
                        //         chunks: 'all',
                        //         priority: -10,
                        //         enforce: true,
                        //     },
                        // },
                    },
                    runtimeChunk: {
                        name: entrypoint => `runtime-${entrypoint.name}`,
                    },
                }
                : {},
        },

        performance: false,

        ...config.target === 'web'
            ? {
                node: {
                    module: 'empty',
                    dgram: 'empty',
                    dns: 'mock',
                    fs: 'empty',
                    http2: 'empty',
                    net: 'empty',
                    tls: 'empty',
                    child_process: 'empty',
                },
            }
            : {},

        ...config.target === 'node'
            ? {
                externals: [
                    externals({
                        whitelist: [/\.(sa|sc|c)ss$/],
                    }),
                ],

                node: false,
            }
            : {},

        watchOptions: {
            aggregateTimeout: 600,
            ignored: /[\\/]node_modules[\\/]/,
        },
    };
    return merge(common, config);
};
module.exports.isDev = isDev;
