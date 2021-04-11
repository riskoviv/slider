const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const chokidar = require('chokidar');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: isDev ? 'inline-source-map' : false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'slider test',
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
  devServer: {
    contentBase: './dist',
    port: 4200,
    hot: true,
    openPage: 'index.html',
    stats: 'minimal',
    before(app, server) {
      chokidar.watch([
        './src/index.html',
      ]).on('all', function() {
        server.sockWrite(server.sockets, 'content-changed');
      });
    },
  },
};