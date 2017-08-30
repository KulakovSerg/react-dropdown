const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const PROD = process.env.NODE_ENV === 'production';
const SOURCE_MAP = !PROD ? '?sourceMap' : '';
const MODULE_PATHS = [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'node_modules'),
];
const SASS_PATHS = `${
    SOURCE_MAP ? '&' : '?'
}includePaths[]=${
    MODULE_PATHS.join('&includePaths[]=')
}`;

const plugins = [
    new ExtractTextPlugin({
        filename: './index.css',
        allChunks: true,
        // disable: !PROD, // TODO SpriteLoaderPlugin on dev env
    }),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(PROD ? 'production' : 'development'),
        },
    }),
    new HtmlWebpackPlugin({
        title: 'Components showcase',
        filename: 'index.html',
        template: 'Showcase/Showcase.html',
        alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
    new SpriteLoaderPlugin(),
];
if (PROD) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '.',
        filename: 'script/[name].js',
        chunkFilename: './script/chunk.[name].[id].js',
    },
    resolve: {
        modules: MODULE_PATHS,
        extensions: ['.js', '.jsx', '.scss'],
    },
    resolveLoader: {
        modules: MODULE_PATHS,
    },
    entry: {
        index: './Showcase/Showcase.js',
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: !PROD,
                    },
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        compact: 'true',
                        cacheDirectory: !PROD,
                    },
                },
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: `style-loader${SOURCE_MAP}`,
                    use: `css-loader${SOURCE_MAP}!sass-loader${SOURCE_MAP}${SASS_PATHS}`,
                }),
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename: '/sprite.svg',
                        },
                    },
                    'svg-fill-loader',
                    'svgo-loader',
                ],
            },
        ],
    },
    stats: {
        children: false,
    },
    // node: PROD ? false : undefined, // TODO remove this condition (make it always false), but
    // error: "browser-crypto.js: Uncaught ReferenceError: global is not defined"
};
