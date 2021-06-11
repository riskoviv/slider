const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[fullhash:7].${ext}`);
const filepath = (pathdata, ext) => (pathdata.chunk.name === 'demo-page' ? `demo/${filename(ext)}` : filename(ext));

module.exports = {
  mode: 'development',
  entry: {
    'slider-plugin': './src/slider-plugin.ts',
    'demo-page': './src/demo/demo-page.js',
  },
  output: {
    filename: (pathdata) => filepath(pathdata, 'js'),
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
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
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Slider plugin test',
      template: './src/demo/demo-page.html',
      filename: 'demo/demo-page.html',
    }),
    new FaviconsWebpackPlugin({
      logo: './src/demo/favicon.png',
      outputPath: './demo/assets',
      publicPath: 'demo',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: (pathdata) => filepath(pathdata, 'css'),
    }),
  ],
  externals: {
    jquery: 'jQuery',
  },
  devServer: {
    openPage: 'demo/demo-page.html',
    hot: false,
    overlay: true,
    port: 4200,
    stats: 'minimal',
  },
};
