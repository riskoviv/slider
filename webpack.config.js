const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// const isDev = proces.env.NODE_ENV === 'development';
// const isProd = !isDev;

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
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'slider test',
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
  ],
  devServer: {
    contentBase: './dist',
    port: 4200,
    hot: false,
    openPage: 'index.html',
    stats: 'minimal',
  },
  // devtool: isDev ? 'source-map' : '',
};