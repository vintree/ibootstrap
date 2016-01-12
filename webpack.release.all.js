// webpack.config.js
var path = require("path");
var webpack = require('webpack');
var Clean = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var UglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    }
});
var CopyWebpackPlugin = require('copy-webpack-plugin');
var SwigWebpackPlugin = require('swig-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        index: './app/js/js/ibootstrap.all.js',
    },
    output: {
        publicPath: "http://127.0.0.1:9090/static/dist/",
        path: path.join(__dirname, 'dist/js/'),
        filename: 'ibootstrap.all.min.js'
    },
    resolve: {
        extensions: ['', '.js', 'jsx', '.sass', '.css', '.png', '.jpg', '.woff', '.ttf', '.eot', '.svg'],
        root: __dirname
    },
    // 新添加的module属性
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015']
                }
            },
            {
                test: /\.(css)$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.scss$/,
                loader: "style!css!sass"
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.woff$/,
                loader: "url?limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.ttf$/,
                loader: "file"
            },
            {
                test: /\.eot$/,
                loader: "file"
            },
            {
                test: /\.svg$/,
                loader: "file"
            }]
    },
    plugins: [
        UglifyJsPlugin,
        new CopyWebpackPlugin([
            { from: 'app/js/lib', to: './source/' },
        ])
    ]
};



/*
用 webpack --config webpack.release.js 指定另一个名字的配置文件
这个文件当中可以写不一样配置, 专门用于代码上线时的操作
*/
