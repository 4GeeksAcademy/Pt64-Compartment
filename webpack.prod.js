const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
    mode: 'production',
    entry: './src/front/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            ['@babel/plugin-transform-runtime', { regenerator: true }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,  // Handles CSS files
                use: [
                    MiniCssExtractPlugin.loader,  // Extracts CSS into separate files (for production)
                    'css-loader',  // Interprets `@import` and `url()` in CSS
                    {
                        loader: 'postcss-loader',  // Apply PostCSS transformations
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('autoprefixer')()  // Automatically add vendor prefixes
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif|jpeg|webp)$/,  // Handles image assets
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'  // Output assets in 'assets' folder
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf|svg)$/,  // Handles fonts
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]'  // Output fonts in 'assets/fonts' folder
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),  // Cleans the output directory before each build
        new HtmlWebpackPlugin({
            favicon: '4geeks.ico',
            template: './public/index.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'  // Outputs CSS file
        }),
        new Dotenv(),  // Load the `.env` file
        new webpack.DefinePlugin({
            'process.env.BASENAME': JSON.stringify(process.env.BASENAME),
            'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
            'process.env.REACT_APP_RAPIDAPI_KEY': JSON.stringify(process.env.REACT_APP_RAPIDAPI_KEY)
        })
    ]
});
