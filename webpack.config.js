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
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
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
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new cssOptimizer({})
  ],
  devServer: {
    // hot: true,
    host: '0.0.0.0',
    port: '8080',
    proxy: {
      '/dist/krb': {
        target: 'http://kpiradiobot.ga',
        pathRewrite: { '^/dist/krb': '' }
      }
    }
  }
}
