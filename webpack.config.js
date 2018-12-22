'use strict';

const { VueLoaderPlugin } = require('vue-loader');
const HWP = require('html-webpack-plugin');

const config = {
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
      favicon: './src/assets/ebalo-bota.png'
    }),
  ],

};

module.exports = env => {
  const dev = env.delevopment;

  if (dev) {
    config.devtool = 'source-map';
    config.devServer = {
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
    };
    config.mode = 'development';

  } else {
    const cssExtracter = require('mini-css-extract-plugin');
    const cssOptimizer = require('optimize-css-assets-webpack-plugin');

    config.plugins.push(
      new cssExtracter({
        filename: '[name].css'
      }),
      new cssOptimizer({})
    );
    config.module.rules[3].use[0] = cssExtracter.loader;
  }

  console.dir(config);

  return config;
};
