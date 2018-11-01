'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HWP = require('html-webpack-plugin');

module.exports = (env) => ({
  mode: 'development',
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
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HWP({
      template: './src/index.dev.html',
      inject: 'body',
      minify: true
    }),
  ],
  devtool: 'source-map',
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
});
