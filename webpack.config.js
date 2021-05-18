const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[fullhash:7].${ext}`);

module.exports = {
  mode: 'development',
  entry: {
    'slider-plugin': './src/slider-plugin.ts',
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: isDev ? 'eval-source-map' : false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'slider test',
      template: './src/demo/index.html',
      filename: 'demo/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
  ],
  externals: {
    jquery: 'jQuery',
  },
  devServer: {
    openPage: 'demo/index.html',
    hot: true,
    overlay: true,
    port: 4200,
    stats: 'minimal',
  },
};
