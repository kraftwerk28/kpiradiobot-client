'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HWP = require('html-webpack-plugin');
const cssExtracter = require('mini-css-extract-plugin');
const cssOptimizer = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g)$/,
        loader: 'file-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' :
            cssExtracter.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HWP({
      template: './src/index.html',
      inject: 'body',
      minify: true
    }),
    new cssExtracter({
      filename: '[name].css'
    }),
    new cssOptimizer({})
  ],
  devServer: {
    host: '0.0.0.0',
    port: '8081',
    overlay: true,
    stats: 'minimal',
    proxy: {
      '/krb': {
        target: 'http://kpiradiobot.ga',
        pathRewrite: { '^/krb': '' }
      }
    }
  }
}
