// webpack.release.js
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
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    entry: {
        index: './app/js/jsx/index.js',
        starResult: './app/js/jsx/starResult.js',
        vendor: ['jquery']
    },
    output: {
        path: path.join(__dirname, 'dist/js/'),//引用文件路径
        // publicPath: "http://127.0.0.1:9090/static/dist/",
        publicPath: '../js/',//html引用路径，在这里是本地地址。
        filename: '[chunkhash].[name].js'//打包后的名字
    },
    resolve: {
        extensions: ['', '.js', 'jsx', '.sass', '.css', '.png', '.jpg', '.woff', '.ttf', '.eot', '.svg'],
        root: __dirname
    },
    // 新添加的module属性
    module: {
        loaders: [
            // {
            //     test: /\.js?$/,
            //     loader: 'babel',
            //     exclude: /(node_modules|bower_components)/,
            //     query: {
            //         presets: ['es2015']
            //     }
            // },
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015']
                }
            },
            //使用link引用
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            // },
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
        commonsPlugin,
        UglifyJsPlugin
        // new webpack.ProvidePlugin({
        //     $: 'jquery'
        // }),
        // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')//这是第三方库打包生成的文件
        // new Clean(['./dist/js/', './dist/html/']),
        // new HtmlWebpackPlugin(
        //     {
        //         filename: ['../html/starResult.html', '../html/index.html'],
        //         template: ['./app/html/starResult.html', './app/html/index.html'], // 原始模块
        //         inject: 'body', // 放在body中  & eq: 'head'  放在head中
        //         chunks: ['starResult']
        //     }
        // ),
        // new HtmlWebpackPlugin(
        //     {
        //         filename: '../html/index.html',
        //         template: './app/html/index.html', // 原始模块
        //         inject: 'body', // 放在body中  & eq: 'head'  放在head中
        //         chunks: ['index']
        //     }
        // ),
        // new CopyWebpackPlugin([
        //     { from: './app/img/', to: '../img/' },
        //     { from: './app/font/', to: '../font' }
        // ])
        // new ExtractTextPlugin("[name].css")
    ]
};



/*
用 webpack --config webpack.min.js 指定另一个名字的配置文件
这个文件当中可以写不一样配置, 专门用于代码上线时的操作
*/
