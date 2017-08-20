const config = require('./webpack.config.js');
const path = require('path');
const webpack = require('webpack');

config.entry = {
    'react-hot-loader/patch': 'react-hot-loader/patch',
    index: './Showcase/Showcase.js',
};

config.output = {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'scripts/[name].js',
    chunkFilename: 'chunk.[name].[id].js',
};

config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin());


config.devServer = {
    hot: true,
    contentBase: path.join(__dirname, 'dist'),
    overlay: {
        warnings: true,
        errors: true,
    },
    publicPath: '/dist',
};

module.exports = config;
