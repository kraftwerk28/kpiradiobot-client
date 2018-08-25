'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HWP = require('html-webpack-plugin');
// const bap = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/
      },
      /*
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      */
      {
        test: /\.s(c|a)ss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HWP({
      template: './src/index.html',
      inject: 'body'
    }),
    // new bap()
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
