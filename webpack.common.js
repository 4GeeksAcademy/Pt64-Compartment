const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
module.exports = {
  entry: [
    './src/front/js/index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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
        test: /\.css$/,  // Handles CSS
        use: [
          "style-loader",  // Injects CSS into DOM (development only)
          "css-loader"     // Interprets @import and url() like import/require()
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|jpeg|webp)$/,  // Handles images
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'  // Puts images into the 'assets' folder
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)$/,  // Handles fonts
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'  // Puts fonts into the 'assets/fonts' folder
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new CleanWebpackPlugin(),  // Cleans the output directory before every build
    new HtmlWebpackPlugin({
      favicon: '4geeks.ico',
      template: './public/index.html',
      filename: 'index.html'
    }),
    new Dotenv(),  // Load the `.env` file
    new webpack.DefinePlugin({
      'process.env.BASENAME': JSON.stringify(process.env.BASENAME),
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
      'process.env.REACT_APP_RAPIDAPI_KEY': JSON.stringify(process.env.REACT_APP_RAPIDAPI_KEY)
    })
  ]
};
